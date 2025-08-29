import { Response } from 'express'
import { IWalletPaymentService } from '../../services/genericService/interfaces/IWalletPaymentService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'

// Controller responsible for handling student wallet payments (Razorpay integration)
export class StudentWalletPaymentController {
  // Inject walletPaymentService dependency (handles Razorpay operations + wallet crediting)
  constructor(private walletPaymentService: IWalletPaymentService) {}

  /**
   * Create a Razorpay order for adding money to the wallet
   * - Expects "amount" in request body
   * - Delegates order creation to walletPaymentService
   * - Responds with created order details
   */
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount } = req.body // Get amount from request body
      const order = await this.walletPaymentService.createOrder(amount) // Call service to create Razorpay order
      res.status(StatusCode.OK).json({ success: true, order }) // Send order details in response
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create Razorpay order',
      })
    }
  }

  /**
   * Verify Razorpay payment and credit wallet
   * - Expects orderId, paymentId, signature, and amount in request body
   * - Validates userId from authenticated request
   * - Calls walletPaymentService to verify payment and update wallet balance
   * - Responds with updated wallet details
   */
  async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract Razorpay payment details from request body
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body

      const userId = req.user?.id // Extract logged-in user ID

      // If user ID is missing, return error response
      if (!userId) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'User ID not found',
        })
        return
      }

      // Verify payment and credit wallet using service
      const wallet = await this.walletPaymentService.verifyAndCreditWallet({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount,
        userId,
        role: 'student', // Specify role for ownership
        onModel: 'User', // Reference model type for wallet owner
      })

      // Respond with updated wallet details
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error: any) {
      console.error(error)
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Payment verification failed',
      })
    }
  }
}
