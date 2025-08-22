import { Request, Response } from 'express'
import { IInstructorVerificationService } from '../../services/instructorServices/interfaces/IInstructorVerificationService'
import { uploadToS3Bucket } from '../../utils/s3Bucket'
import { StatusCode } from '../../types/enums'
import { VerificationErrorMessages, VerificationSuccessMessages } from '../../types/constants'

export class InstructorVerificationController {
  private verificationService: IInstructorVerificationService

  constructor(verificationService: IInstructorVerificationService) {
    this.verificationService = verificationService
    // Service responsible for instructor verification DB operations
  }

  // =========================
  // Submit Verification Request
  // =========================
  async submitRequest(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body

      // Logging request body and uploaded files for debugging
      console.log('body', req.body)
      console.log('Files', req.files || req.file)

      // Check if files exist
      if (!req.files || typeof req.files !== 'object') {
        throw new Error(VerificationErrorMessages.DOCUMENTS_MISSING)
      }

      // Extract files from multer request
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      const degreeCertificate = files.degreeCertificate?.[0] || null
      const resume = files.resume?.[0] || null

      // Ensure both documents are provided
      if (!degreeCertificate || !resume) {
        res.status(StatusCode.BAD_REQUEST).send({
          success: false,
          message: VerificationErrorMessages.NO_DOCUMENTS_RECEIVED,
        })
        return
      }

      // Check if there is already a verification request for this email
      const existingRequest = await this.verificationService.getRequestByEmail(email)

      // Upload files to S3 bucket and get URLs
      const degreeCertificateUrl = await uploadToS3Bucket(degreeCertificate, 'degreeCertificate')
      const resumeUrl = await uploadToS3Bucket(resume, 'resume')

      if (existingRequest) {
        const currentStatus = existingRequest.status

        // ❌ Request is pending → cannot submit again
        if (currentStatus === 'pending') {
          res.status(StatusCode.BAD_REQUEST).send({
            success: false,
            message: 'Verification already submitted and under review.',
          })
          return
        }

        // ❌ Request already approved → no need to submit
        if (currentStatus === 'approved') {
          res.status(StatusCode.BAD_REQUEST).send({
            success: false,
            message: 'You are already verified.',
          })
          return
        }

        // ✅ If rejected → allow re-verification
        const updatedRequest = await this.verificationService.reverifyRequest(
          name,
          email,
          degreeCertificateUrl,
          resumeUrl,
        )

        res.status(StatusCode.OK).send({
          success: true,
          message: 'Reverification submitted successfully.',
          data: updatedRequest,
        })
        return
      }

      // 🔰 First-time submission → create new verification request
      const newRequest = await this.verificationService.sendVerifyRequest(
        name,
        email,
        degreeCertificateUrl,
        resumeUrl,
        'pending',
      )

      res.status(StatusCode.OK).send({
        success: true,
        message: VerificationSuccessMessages.VERIFICATION_REQUEST_SENT,
        data: newRequest,
      })
    } catch (error: any) {
      console.log('verificationerror', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      })
    }
  }

  // =========================
  // Fetch Verification Request by Email
  // =========================
  async getRequestByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params

      // Get verification request from DB
      const result = await this.verificationService.getRequestByEmail(email)

      res.status(StatusCode.OK).json({
        success: true,
        message: VerificationSuccessMessages.REQUEST_DATA_FETCHED,
        data: result,
      })
    } catch (error: any) {
      console.log(error)
      res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: error.message,
      })
    }
  }
}
