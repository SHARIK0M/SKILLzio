import { Response } from 'express'
import { IWalletPaymentService } from '../../services/genericService/interfaces/IWalletPaymentService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IInstructorWalletPaymentController } from './interfaces/IInstructorWalletPaymentController'

// Controller to handle instructor wallet payments (Razorpay integration)
export class InstructorWalletPaymentController implements IInstructorWalletPaymentController {
  // Inject walletPaymentService dependency through constructor
  constructor(private walletPaymentService: IWalletPaymentService) {}

  // Create Razorpay order for instructor wallet recharge
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get amount from request body
      const { amount } = req.body

      // Call service to create Razorpay order
      const order = await this.walletPaymentService.createOrder(amount)

      // Send success response with created order details
      res.status(StatusCode.OK).json({ success: true, order })
    } catch (error) {
      console.error(error)

      // Send error response if order creation fails
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create Razorpay order',
      })
    }
  }

  // Verify payment and credit wallet after successful Razorpay transaction
  async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract Razorpay payment details from request body
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body

      // Get instructor ID from authenticated request
      const userId = req.user?.id

      // If no instructor ID found, return error response
      if (!userId) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Instructor ID not found',
        })
        return
      }

      // Verify Razorpay signature and credit amount to instructor's wallet
      const wallet = await this.walletPaymentService.verifyAndCreditWallet({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount,
        userId,
        role: 'instructor', // Role is explicitly set to instructor
        onModel: 'Instructor', // Specifies that this wallet belongs to Instructor model
      })

      // Send success response with updated wallet details
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error: any) {
      console.error(error)

      // Send error response if payment verification fails
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Payment verification failed',
      })
    }
  }
}
