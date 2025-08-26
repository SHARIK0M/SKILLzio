import { IStudentCheckoutService } from './interfaces/IStudentCheckoutService'
import { IStudentCheckoutRepository } from '../../repositories/studentRepository/interfaces/IStudentCheckoutRepository'
import { IStudentCartRepository } from '../../repositories/studentRepository/interfaces/IStudentCartRepository'
import { IWalletService } from '../genericService/interfaces/IWalletService'
import { razorpay } from '../../utils/razorpay'
import { Types } from 'mongoose'
import { IOrder } from '../../models/order.Model'
import { IPayment } from '../../models/payment.Model'
import { IEnrollment } from '../../models/enrollment.Model'

// Service class handling student checkout (payment, order creation, enrollment, and revenue split)
export class StudentCheckoutService implements IStudentCheckoutService {
  constructor(
    private readonly checkoutRepo: IStudentCheckoutRepository, // Repository for checkout-related DB operations
    private readonly cartRepo: IStudentCartRepository, // Repository for managing student cart
    private readonly walletService: IWalletService, // Wallet service for handling balance and transactions
  ) {}

  // Method to start checkout process
  async initiateCheckout(
    userId: Types.ObjectId, // ID of the student
    courseIds: Types.ObjectId[], // Courses selected for purchase
    totalAmount: number, // Total payable amount
    paymentMethod: 'wallet' | 'razorpay', // Payment method: wallet or Razorpay
  ): Promise<IOrder> {
    // Get list of courses the student has already enrolled in
    const enrolledCourseIds = await this.checkoutRepo.getEnrolledCourseIds(userId)

    // Filter out courses that are already enrolled
    const alreadyEnrolled = courseIds.filter((cid) =>
      enrolledCourseIds.some((eid) => eid.equals(cid)),
    )

    // If student tries to re-purchase already enrolled courses, throw error
    if (alreadyEnrolled.length > 0) {
      const names = await this.checkoutRepo.getCourseNamesByIds(alreadyEnrolled)
      throw new Error(`Remove ${names.join(', ')} from cart, already enrolled.`)
    }

    // Case 1: Wallet payment
    if (paymentMethod === 'wallet') {
      // Get student's wallet details
      const wallet = await this.walletService.getWallet(userId)

      // Check wallet balance availability
      if (!wallet || wallet.balance < totalAmount) {
        throw new Error('Insufficient wallet balance')
      }

      // Create a new order entry
      const order = (await this.checkoutRepo.createOrder(
        userId,
        courseIds,
        totalAmount,
        'wallet_txn_' + Date.now(), // unique transaction ID
      )) as IOrder

      // Deduct amount from student's wallet
      await this.walletService.debitWallet(
        userId,
        totalAmount,
        'Course Purchase',
        order._id.toString(),
      )

      // Mark order as successful
      await this.checkoutRepo.updateOrderStatus(order._id, 'SUCCESS')

      // Save payment details in DB
      await this.checkoutRepo.savePayment({
        orderId: order._id,
        userId,
        paymentId: order._id.toString(),
        method: 'wallet',
        amount: totalAmount,
        status: 'SUCCESS',
      })

      // Create enrollments for purchased courses
      await this.checkoutRepo.createEnrollments(userId, courseIds)

      // Revenue distribution between instructor and admin (wallet payment flow)
      const courseRepo = this.checkoutRepo.getCourseRepo()
      const txnId = order._id.toString()

      for (const courseId of courseIds) {
        const course = await courseRepo.findById(courseId.toString())
        if (!course || !course.instructorId) continue

        const instructorId = new Types.ObjectId(course.instructorId)

        // Instructor receives 90%, Admin receives 10%
        const instructorShare = (course.price * 90) / 100
        const adminShare = (course.price * 10) / 100

        // Ensure instructor wallet exists, otherwise create one
        let instructorWallet = await this.walletService.getWallet(instructorId)
        if (!instructorWallet) {
          instructorWallet = await this.walletService.initializeWallet(
            instructorId,
            'Instructor',
            'instructor',
          )
        }

        // Credit instructor's wallet
        await this.walletService.creditWallet(
          instructorId,
          instructorShare,
          `Revenue for ${course.courseName}`,
          txnId,
        )

        // Credit admin's wallet using admin email
        await this.walletService.creditAdminWalletByEmail(
          process.env.ADMINEMAIL!,
          adminShare,
          `Admin share for ${course.courseName}`,
          txnId,
        )
      }

      // Clear cart after successful purchase
      await this.cartRepo.clear(userId)

      return order
    }

    // Case 2: Razorpay payment flow
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`, // unique receipt ID
    })

    // Save order details with Razorpay order ID
    return this.checkoutRepo.createOrder(userId, courseIds, totalAmount, razorpayOrder.id)
  }

  // Method to verify and finalize checkout after successful payment
  async verifyAndCompleteCheckout(
    orderId: Types.ObjectId, // Order ID
    paymentId: string, // Payment transaction ID
    method: string, // Payment method (wallet/razorpay)
    amount: number, // Paid amount
  ): Promise<{
    order: IOrder // Final order
    payment: IPayment // Payment record
    enrollments: IEnrollment[] // Created enrollments
  }> {
    // Update order status to SUCCESS
    const updatedOrder = await this.checkoutRepo.updateOrderStatus(orderId, 'SUCCESS')
    if (!updatedOrder) throw new Error('Order not found or could not be updated')

    // Save payment details
    const payment = await this.checkoutRepo.savePayment({
      orderId,
      userId: updatedOrder.userId,
      paymentId,
      method,
      amount,
      status: 'SUCCESS',
    })

    // Create enrollments for purchased courses
    const enrollments = await this.checkoutRepo.createEnrollments(
      updatedOrder.userId,
      updatedOrder.courses,
    )

    // Revenue distribution between instructor and admin (after successful Razorpay payment)
    const courseRepo = this.checkoutRepo.getCourseRepo()
    const txnId = orderId.toString()

    for (const courseId of updatedOrder.courses) {
      const course = await courseRepo.findById(courseId.toString())
      if (!course || !course.instructorId) continue

      const instructorId = new Types.ObjectId(course.instructorId)

      // Instructor gets 90%, Admin gets 10%
      const instructorShare = (course.price * 90) / 100
      const adminShare = (course.price * 10) / 100

      // Ensure instructor wallet exists, else create
      let instructorWallet = await this.walletService.getWallet(instructorId)
      if (!instructorWallet) {
        instructorWallet = await this.walletService.initializeWallet(
          instructorId,
          'Instructor',
          'instructor',
        )
      }

      // Credit instructor's wallet
      await this.walletService.creditWallet(
        instructorId,
        instructorShare,
        `Revenue for ${course.courseName}`,
        txnId,
      )

      // Credit admin's wallet
      await this.walletService.creditAdminWalletByEmail(
        process.env.ADMINEMAIL!,
        adminShare,
        `Admin share for ${course.courseName}`,
        txnId,
      )
    }

    // Clear student's cart after successful checkout
    await this.cartRepo.clear(updatedOrder.userId)

    return {
      order: updatedOrder,
      payment,
      enrollments,
    }
  }
}
