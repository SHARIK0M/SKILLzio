import { Response } from 'express'
import { IInstructorMembershipOrderController } from './interfaces/IInstructorMembershipOrderController'
import { IInstructorMembershipOrderService } from '../../services/instructorServices/interfaces/IInstructorMembershipOrderService'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { StatusCode } from '../../types/enums'
import { IInstructorMembershipService } from '../../services/instructorServices/interfaces/IInstructorMembershipService'
import { ResponseMessages } from '../../types/constants'
import { generateMembershipReceiptPdf } from '../../utils/generateMembershipReceiptPdf'

// Controller handling all membership order related operations for instructors
export class InstructorMembershipOrderController implements IInstructorMembershipOrderController {
  // Constructor injecting membership order service and instructor service
  constructor(
    private readonly service: IInstructorMembershipOrderService,
    private readonly instructorService: IInstructorMembershipService,
  ) {}

  // Start the checkout process for a membership plan
  async initiateCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params // Extract planId from request params
      const instructorId = req.user?.id // Get instructor ID from authenticated user

      // Validate input
      if (!planId || !instructorId) {
        res.status(StatusCode.BAD_REQUEST).json({ message: ResponseMessages.MISSING_DATA })
        return
      }

      // Check if instructor exists
      const instructor = await this.instructorService.getInstructorById(instructorId)
      if (!instructor) {
        res.status(StatusCode.NOT_FOUND).json({ message: ResponseMessages.INSTRUCTOR_NOT_FOUND })
        return
      }

      // Prevent purchase if instructor already has an active membership
      if (
        instructor.membershipExpiryDate &&
        new Date(instructor.membershipExpiryDate) > new Date()
      ) {
        res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: ResponseMessages.ALREADY_ACTIVE_MEMBERSHIP,
          expiryDate: instructor.membershipExpiryDate,
        })
        return
      }

      // Initiate checkout through service
      const result = await this.service.initiateCheckout(instructorId, planId)
      res.status(StatusCode.OK).json(result)
    } catch (error) {
      console.error('Checkout error:', error)
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: ResponseMessages.CHECKOUT_FAILED })
    }
  }

  // Verify payment/order details and activate membership
  async verifyOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { razorpayOrderId, paymentId, signature, planId } = req.body // Payment details
      const instructorId = req.user?.id

      // Validate input
      if (!razorpayOrderId || !paymentId || !signature || !planId || !instructorId) {
        res.status(StatusCode.BAD_REQUEST).json({ message: ResponseMessages.MISSING_DATA })
        return
      }

      // Verify payment and activate membership
      await this.service.verifyAndActivateMembership({
        razorpayOrderId,
        paymentId,
        signature,
        planId,
        instructorId,
      })

      res.status(StatusCode.OK).json({ message: ResponseMessages.MEMBERSHIP_ACTIVATED })
    } catch (error) {
      console.error('Verification error:', error)
      res.status(StatusCode.BAD_REQUEST).json({ message: ResponseMessages.VERIFICATION_FAILED })
    }
  }

  // Purchase a membership using wallet balance
  async purchaseWithWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params
      const instructorId = req.user?.id

      // Validate input
      if (!planId || !instructorId) {
        res.status(StatusCode.BAD_REQUEST).json({ message: ResponseMessages.MISSING_DATA })
        return
      }

      // Check if instructor exists
      const instructor = await this.instructorService.getInstructorById(instructorId)
      if (!instructor) {
        res.status(StatusCode.NOT_FOUND).json({ message: ResponseMessages.INSTRUCTOR_NOT_FOUND })
        return
      }

      // Prevent wallet purchase if membership is still active
      if (
        instructor.membershipExpiryDate &&
        new Date(instructor.membershipExpiryDate) > new Date()
      ) {
        res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: ResponseMessages.ALREADY_ACTIVE_MEMBERSHIP,
          expiryDate: instructor.membershipExpiryDate,
        })
        return
      }

      // Complete wallet purchase
      await this.service.purchaseWithWallet(instructorId, planId)

      res.status(StatusCode.OK).json({ message: ResponseMessages.MEMBERSHIP_ACTIVATED })
    } catch (error: any) {
      console.error('Wallet purchase error:', error)
      res.status(StatusCode.BAD_REQUEST).json({
        message: error?.message || ResponseMessages.WALLET_PURCHASE_FAILED,
      })
    }
  }

  // Get all membership orders of the authenticated instructor
  async getInstructorOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id
      if (!instructorId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Instructor not found' })
        return
      }

      const page = parseInt(req.query.page as string) || 1 // Pagination page
      const limit = parseInt(req.query.limit as string) || 10 // Pagination limit

      // Fetch paginated order history
      const { data, total } = await this.service.getInstructorOrders(instructorId, page, limit)

      res.status(StatusCode.OK).json({ data, total })
    } catch (error) {
      console.error('Fetch order history error:', error)
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to fetch purchase history' })
    }
  }

  // Get details of a specific membership order by transaction ID
  async getMembershipOrderDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { txnId } = req.params
      const instructorId = req.user?.id

      // Validate input
      if (!txnId || !instructorId) {
        res.status(StatusCode.BAD_REQUEST).json({ message: 'Missing data' })
        return
      }

      // Get order details
      const order = await this.service.getOrderByTxnId(txnId, instructorId)
      if (!order) {
        res.status(StatusCode.NOT_FOUND).json({ message: 'Order not found' })
        return
      }

      res.status(StatusCode.OK).json(order)
    } catch (err: any) {
      console.error('Order detail fetch error:', err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch order' })
    }
  }

  // Download PDF receipt for a specific membership order
  async downloadReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { txnId } = req.params
      const instructorId = req.user?.id

      // Validate input
      if (!txnId || !instructorId) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: 'Missing txnId or user not authenticated' })
        return
      }

      // Get order by transaction ID
      const order = await this.service.getOrderByTxnId(txnId, instructorId)
      if (!order) {
        res.status(StatusCode.NOT_FOUND).json({ message: 'Order not found' })
        return
      }

      // Generate receipt PDF from utility function
      const pdfBuffer = await generateMembershipReceiptPdf(order)

      // Set headers for PDF file download
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=Receipt_${txnId}.pdf`)

      // Send generated PDF
      res.send(pdfBuffer)
    } catch (err) {
      console.error('Receipt generation error:', err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Failed to generate receipt' })
    }
  }
}
