import { Response } from 'express'
import { IWalletPaymentService } from '../../services/genericService/interfaces/IWalletPaymentService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IAdminWalletPaymentController } from './interfaces/IAdminWalletPaymentController'

// Controller class for handling Admin Wallet Payments
export class AdminWalletPaymentController implements IAdminWalletPaymentController {
  private walletPaymentService: IWalletPaymentService

  // Injecting WalletPaymentService dependency through constructor
  constructor(walletPaymentService: IWalletPaymentService) {
    this.walletPaymentService = walletPaymentService
  }

  // Method to create a Razorpay order
  async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount } = req.body // Extract amount from request body

      // Call service method to create Razorpay order
      const order = await this.walletPaymentService.createOrder(amount)

      // Send success response with order details
      res.status(StatusCode.OK).json({ success: true, order })
    } catch (error) {
      console.error(error)
      // Send failure response if order creation fails
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to create Razorpay order',
      })
    }
  }

  // Method to verify Razorpay payment and credit wallet
  async verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract payment details from request body
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body
      const userId = req.user?.id // Get admin ID from authenticated request

      // If admin ID not found, return error response
      if (!userId) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Admin ID not found',
        })
        return
      }

      // Call service method to verify payment and credit wallet
      const wallet = await this.walletPaymentService.verifyAndCreditWallet({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount,
        userId,
        role: 'admin', // Hardcoded role for Admin
        onModel: 'Admin', // Hardcoded model for Admin
      })

      // Send success response with updated wallet details
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error: any) {
      console.error(error)
      // Send failure response if verification fails
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Payment verification failed',
      })
    }
  }
}
