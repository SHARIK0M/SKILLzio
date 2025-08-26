import { Request, Response } from 'express'
import { IStudentCheckoutController } from './interfaces/IStudentCheckoutController'
import { IStudentCheckoutService } from '../../services/studentServices/interfaces/IStudentCheckoutService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { CheckoutErrorMessages, CheckoutSuccessMessage } from '../../types/constants'
import { Types } from 'mongoose'

// Controller class that handles all checkout-related actions for students
export class StudentCheckoutController implements IStudentCheckoutController {
  // Dependency injection of checkout service
  constructor(private readonly checkoutService: IStudentCheckoutService) {}

  /**
   * Step 1: Initiates the checkout process
   * - Extracts course IDs, amount, and payment method from request
   * - Validates user authentication
   * - Calls service to create an order
   * - Handles specific errors (already enrolled, insufficient wallet, etc.)
   */
  async initiateCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { courseIds, totalAmount, paymentMethod } = req.body
      const userId = new Types.ObjectId(req.user?.id)

      // Validate user and payment method
      if (!userId || !paymentMethod) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: CheckoutErrorMessages.USER_NOT_AUTHENTICATED,
        })
        return
      }

      // Create order through service
      const order = await this.checkoutService.initiateCheckout(
        userId,
        courseIds,
        totalAmount,
        paymentMethod,
      )

      // Return success response with created order
      res.status(StatusCode.OK).json({
        success: true,
        message: CheckoutSuccessMessage.ORDER_CREATED,
        order,
      })
    } catch (error: any) {
      const errorMsg = error.message || CheckoutErrorMessages.CHECKOUT_FAILED

      // Handle business-specific errors
      if (errorMsg.includes('already enrolled') || errorMsg.includes('Insufficient wallet')) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: errorMsg,
        })
        return
      }

      // Handle generic server error
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CheckoutErrorMessages.CHECKOUT_FAILED,
      })
    }
  }

  /**
   * Step 2: Completes the checkout after payment
   * - Accepts payment details from request
   * - Verifies payment and completes enrollment
   * - Returns success message if successful
   */
  async completeCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentId, method, amount } = req.body

      // Verify and complete payment using service
      const result = await this.checkoutService.verifyAndCompleteCheckout(
        orderId,
        paymentId,
        method,
        amount,
      )

      // Return success response with enrollment confirmation
      res.status(StatusCode.OK).json({
        success: true,
        message: CheckoutSuccessMessage.PAYMENT_SUCCESS_COURSE_ENROLLED,
        data: result,
      })
    } catch (error) {
      console.error('Payment Completion Error:', error)

      // Return failure response if verification fails
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CheckoutErrorMessages.PAYMENT_FAILED,
      })
    }
  }
}
