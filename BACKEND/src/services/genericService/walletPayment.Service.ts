import { Types } from 'mongoose'
import { IWallet } from '../../models/wallet.Model'
import { IWalletPaymentService } from './interfaces/IWalletPaymentService'
import { IWalletPaymentRepository } from '../../repositories/genericRepo/interfaces/IWalletPaymentRepository'
import { IWalletService } from './interfaces/IWalletService'

// Service class that handles wallet payments using Razorpay
export class WalletPaymentService implements IWalletPaymentService {
  constructor(
    private paymentRepo: IWalletPaymentRepository, // Repository for handling Razorpay payment operations
    private walletService: IWalletService, // Service for managing wallet operations
  ) {}

  // Create a new Razorpay order for a given amount
  async createOrder(amount: number): Promise<any> {
    return this.paymentRepo.createRazorpayOrder(amount)
  }

  // Verify Razorpay payment and credit the wallet after successful verification
  async verifyAndCreditWallet({
    orderId,
    paymentId,
    signature,
    amount,
    userId,
    role,
    onModel,
  }: {
    orderId: string // Razorpay order ID
    paymentId: string // Razorpay payment ID
    signature: string // Razorpay signature for verification
    amount: number // Amount to be credited
    userId: string // User ID who made the payment
    role: 'student' | 'instructor' | 'admin' // Role of the user
    onModel: 'User' | 'Instructor' | 'Admin' // Collection name for user reference
  }): Promise<IWallet> {
    // Step 1: Verify Razorpay signature for payment authenticity
    const isValid = this.paymentRepo.verifyPaymentSignature(orderId, paymentId, signature)
    if (!isValid) throw new Error('Invalid Razorpay signature')

    // Step 2: Convert userId string into MongoDB ObjectId
    const userObjectId = new Types.ObjectId(userId)

    // Step 3: Check if wallet exists for the user, if not create a new one
    let wallet = await this.walletService.getWallet(userObjectId)
    if (!wallet) {
      wallet = await this.walletService.initializeWallet(userObjectId, onModel, role)
    }

    // Step 4: Credit the wallet with the payment amount
    const creditedWallet = await this.walletService.creditWallet(
      userObjectId,
      amount,
      'Wallet Recharge', // Description for transaction
      paymentId, // Payment transaction reference
    )

    // Step 5: If crediting fails, throw an error
    if (!creditedWallet) throw new Error('Failed to credit wallet')

    // Step 6: Return the updated wallet
    return creditedWallet
  }
}
