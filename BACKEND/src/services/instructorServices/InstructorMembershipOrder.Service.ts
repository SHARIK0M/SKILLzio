import { IInstructorMembershipOrderService } from './interfaces/IInstructorMembershipOrderService'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Types } from 'mongoose'

import { IInstructorMembershipOrder } from '../../models/instructorMembershipOrder.Model'
import { IInstructorMembershipOrderRepository } from '../../repositories/instructorRepository/interfaces/IInstructorMembershipOrderRepository'
import { IInstructorMembershipRepository } from '../../repositories/instructorRepository/interfaces/IInstructorMembershipRepository'
import IInstructorRepository from '../../repositories/instructorRepository/interfaces/IInstructorRepository'
import { IMembershipPlan } from '../../models/membershipPlan.Model'
import { IWalletService } from '../genericService/interfaces/IWalletService'
import { IEmail } from '../../types/Email'

// Service to handle instructor membership orders (checkout, verification, wallet purchase, etc.)
export class InstructorMembershipOrderService implements IInstructorMembershipOrderService {
  constructor(
    private readonly membershipOrderRepo: IInstructorMembershipOrderRepository,
    private readonly planRepo: IInstructorMembershipRepository,
    private readonly instructorRepo: IInstructorRepository,
    private readonly razorpay: Razorpay,
    private readonly walletService: IWalletService,
    private readonly emailService: IEmail,
  ) {}

  // Step 1: Initiate checkout with Razorpay
  async initiateCheckout(instructorId: string, planId: string) {
    // Ensure instructor exists
    const instructor = await this.instructorRepo.findById(instructorId)
    if (!instructor) throw new Error('Instructor not found')

    // Prevent purchase if membership is still active
    if (instructor.membershipExpiryDate && new Date(instructor.membershipExpiryDate) > new Date()) {
      throw new Error('You already have an active membership.')
    }

    // Get membership plan
    const plan = (await this.planRepo.findById(planId)) as IMembershipPlan
    if (!plan) throw new Error('Invalid plan')

    // Create Razorpay order
    const razorpayOrder = await this.razorpay.orders.create({
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    // Return checkout details
    return {
      razorpayOrderId: razorpayOrder.id,
      amount: plan.price,
      currency: 'INR',
      planName: plan.name,
      durationInDays: plan.durationInDays,
      description: plan.description || '',
      benefits: plan.benefits || [],
    }
  }

  // Step 2: Verify payment signature and activate membership
  async verifyAndActivateMembership({
    razorpayOrderId,
    paymentId,
    signature,
    instructorId,
    planId,
  }: {
    razorpayOrderId: string
    paymentId: string
    signature: string
    instructorId: string
    planId: string
  }): Promise<void> {
    // Verify Razorpay signature for security
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex')

    if (expectedSignature !== signature) {
      throw new Error('Invalid Razorpay signature')
    }

    // Validate instructor
    const instructor = await this.instructorRepo.findById(instructorId)
    if (!instructor) throw new Error('Instructor not found')

    // Check if order already exists
    let order = await this.membershipOrderRepo.findByRazorpayOrderId(razorpayOrderId)

    // Validate plan
    const plan = (await this.planRepo.findById(planId)) as IMembershipPlan
    if (!plan || !plan.durationInDays || !plan._id) {
      throw new Error('Invalid membership plan')
    }

    // Calculate expiry date based on plan duration
    const now = new Date()
    const expiryDate = new Date(now.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000)

    // If no order exists, create one
    if (!order) {
      order = await this.membershipOrderRepo.createOrder({
        instructorId,
        planId: plan._id.toString(),
        razorpayOrderId,
        amount: plan.price,
        status: 'paid',
        startDate: now,
        endDate: expiryDate,
      })
    } else {
      // Prevent duplicate processing of already paid order
      if (order.paymentStatus === 'paid') {
        throw new Error('Order already processed')
      }

      // Update order to mark as paid
      await this.membershipOrderRepo.updateOrderStatus(razorpayOrderId, {
        paymentStatus: 'paid',
        startDate: now,
        endDate: expiryDate,
      })
    }

    // Update instructor profile with active membership
    await this.instructorRepo.update(instructorId, {
      isMentor: true,
      membershipExpiryDate: expiryDate,
      membershipPlanId: new Types.ObjectId(plan._id),
    })

    // Credit admin wallet with membership fee
    await this.walletService.creditAdminWalletByEmail(
      process.env.ADMINEMAIL!,
      plan.price,
      `Instructor Membership (Razorpay): ${plan.name}`,
      paymentId,
    )

    // Send email confirmation to instructor
    await this.emailService.sendMembershipPurchaseEmail(
      instructor.username || 'Instructor',
      instructor.email || '',
      plan.name,
      expiryDate,
    )
  }

  // Step 3: Purchase membership using wallet balance instead of Razorpay
  async purchaseWithWallet(instructorId: string, planId: string): Promise<void> {
    // Validate instructor
    const instructor = await this.instructorRepo.findById(instructorId)
    if (!instructor) throw new Error('Instructor not found')

    // Prevent purchase if membership is still active
    if (instructor.membershipExpiryDate && new Date(instructor.membershipExpiryDate) > new Date()) {
      throw new Error('You already have an active membership.')
    }

    // Validate plan
    const plan = (await this.planRepo.findById(planId)) as IMembershipPlan
    if (!plan || !plan._id) throw new Error('Membership plan not found')

    const amount = plan.price
    const txnId = `wallet_membership_${Date.now()}`

    // Debit instructor wallet
    const instructorWallet = await this.walletService.debitWallet(
      instructor._id.toString(),
      amount,
      `Membership Purchase: ${plan.name}`,
      txnId,
    )

    if (!instructorWallet) {
      throw new Error('Insufficient wallet balance')
    }

    // Credit admin wallet, rollback if fails
    try {
      await this.walletService.creditAdminWalletByEmail(
        process.env.ADMINEMAIL!,
        amount,
        `Instructor Membership: ${plan.name}`,
        txnId,
      )
    } catch (err) {
      // Refund instructor if admin credit fails
      await this.walletService.creditWallet(
        new Types.ObjectId(instructor._id.toString()),
        amount,
        `Refund: Failed admin credit`,
        `refund_${txnId}`,
      )
      throw new Error('Admin credit failed. Transaction rolled back.')
    }

    // Calculate membership expiry
    const now = new Date()
    const expiry = new Date(now.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000)

    // Create order entry
    await this.membershipOrderRepo.createOrder({
      instructorId,
      planId: plan._id.toString(),
      razorpayOrderId: txnId,
      amount,
      status: 'paid',
      startDate: now,
      endDate: expiry,
    })

    // Update instructor with membership details
    await this.instructorRepo.update(instructorId, {
      isMentor: true,
      membershipExpiryDate: expiry,
      membershipPlanId: new Types.ObjectId(plan._id),
    })

    // Send confirmation email
    await this.emailService.sendMembershipPurchaseEmail(
      instructor.username,
      instructor.email,
      plan.name,
      expiry,
    )
  }

  // Fetch all membership orders of an instructor (with pagination)
  async getInstructorOrders(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: IInstructorMembershipOrder[]; total: number }> {
    return await this.membershipOrderRepo.findAllByInstructorId(instructorId, page, limit)
  }

  // Get a single order by transaction ID (only if it belongs to the instructor)
  async getOrderByTxnId(txnId: string, instructorId: string) {
    const order = await this.membershipOrderRepo.findOneByTxnId(txnId)
    if (!order) throw new Error('Order not found')

    // Ensure instructor is authorized to view this order
    const orderInstructorId = (order.instructorId as any)._id
      ? (order.instructorId as any)._id.toString()
      : order.instructorId.toString()

    if (orderInstructorId !== instructorId.toString()) {
      throw new Error('Unauthorized access')
    }

    return order
  }
}
