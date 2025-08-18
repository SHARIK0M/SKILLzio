import { Request, Response } from 'express'
import { IAdminVerificationService } from '../../services/adminServices/interfaces/IAdminVerificationService'
import { StatusCode } from '../../utils/enums'
import { ResponseError } from '../../utils/constants'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { SendEmail } from '../../utils/sendOtpEmail'

export class AdminVerificationController {
  private verificationService: IAdminVerificationService
  private emailService: SendEmail

  constructor(verificationService: IAdminVerificationService) {
    this.verificationService = verificationService // Inject service for DB operations related to verification requests
    this.emailService = new SendEmail() // Initialize email utility for sending approval/rejection emails
  }

  // ======================
  // Get all instructor verification requests
  // Supports pagination and search
  // ======================
  async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      // Parse query parameters for pagination
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''

      // Fetch requests from DB via service layer
      const { data, total } = await this.verificationService.getAllRequests(page, limit, search)

      // Send success response with pagination info
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Verification requests fetched successfully',
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    } catch (error: any) {
      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Something went wrong while fetching verification requests',
      })
    }
  }

  // ======================
  // Get a single verification request by email
  // ======================
  async getRequestData(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params

      // Fetch request data from DB
      const requestData = await this.verificationService.getRequestDataByEmail(email)

      // If request not found, return 404
      if (!requestData) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Verification request not found.',
        })
        return
      }

      // Generate pre-signed URLs for files stored in S3 (resume and degree certificate)
      const resumeUrl = await getPresignedUrl(requestData.resumeUrl)
      const degreeCertificateUrl = await getPresignedUrl(requestData.degreeCertificateUrl)

      // Return request data along with URLs for frontend to download/view files
      res.status(StatusCode.OK).json({
        data: {
          ...requestData.toObject(), // Convert Mongoose document to plain object
          resumeUrl,
          degreeCertificateUrl,
        },
      })
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      })
    }
  }

  // ======================
  // Approve or reject an instructor verification request
  // ======================
  async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email, status, reason } = req.body // Get email, status (approved/rejected), and optional reason from request body

      // Update request status in DB via service layer
      const approvedRequest = await this.verificationService.approveRequest(email, status, reason)

      // If request not found in DB, return 404
      if (!approvedRequest) {
        res
          .status(StatusCode.NOT_FOUND)
          .json({ success: false, message: 'Verification request not found' })
        return
      }

      const name = approvedRequest.username

      if (status === 'approved') {
        // ✅ Send approval email to instructor
        await this.emailService.sendVerificationSuccessEmail(name, email)

        res.status(StatusCode.OK).json({
          success: true,
          message: ResponseError.APPROVE_INSTRUCTOR,
          data: approvedRequest,
        })
      } else if (status === 'rejected') {
        // If rejected, reason is required
        if (!reason) {
          res
            .status(StatusCode.BAD_REQUEST)
            .json({ success: false, message: 'Rejection reason is required.' })
          return
        }

        // ✅ Send rejection email to instructor with reason
        await this.emailService.sendRejectionEmail(name, email, reason)

        res.status(StatusCode.OK).json({
          success: true,
          message: ResponseError.REJECT_INSTRUCTOR,
          data: approvedRequest,
        })
      } else {
        // Invalid status provided
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: 'Invalid request status' })
      }
    } catch (error: any) {
      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message })
    }
  }
}
