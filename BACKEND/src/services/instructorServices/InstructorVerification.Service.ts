import { IInstructorVerificationService } from './interfaces/IInstructorVerificationService'
import { IVerificationModel } from '../../models/verification.Model'
import { IInstructorVerificationRepository } from '../../repositories/instructorRepository/interfaces/IInstructorVerifcationRepository'
import { VerificationErrorMessages } from '../../utils/constants'

// Service class that handles instructor verification requests
// This service connects to the InstructorVerificationRepository (DB layer)
export class InstructorVerificationService implements IInstructorVerificationService {
  private verificationRepository: IInstructorVerificationRepository // Repository for handling DB operations

  constructor(verificationRepository: IInstructorVerificationRepository) {
    this.verificationRepository = verificationRepository
  }

  // Send a new verification request (when an instructor submits documents for verification)
  async sendVerifyRequest(
    username: string,
    email: string,
    degreeCertificateUrl: string,
    resumeUrl: string,
    status: string,
  ): Promise<IVerificationModel> {
    // Save the verification request in the database
    const result = await this.verificationRepository.sendVerifyRequest(
      username,
      email,
      degreeCertificateUrl,
      resumeUrl,
      status,
    )

    // If saving fails, throw an error with a standard message
    if (!result) {
      throw new Error(VerificationErrorMessages.VERIFICATION_REQUEST_FAILED)
    }
    return result
  }

  // Get an instructor's verification request details using their email
  async getRequestByEmail(email: string): Promise<IVerificationModel | null> {
    return await this.verificationRepository.getRequestByEmail(email)
  }

  // Allow instructor to resubmit verification request if rejected
  async reverifyRequest(
    username: string,
    email: string,
    degreeCertificateUrl: string,
    resumeUrl: string,
  ): Promise<IVerificationModel> {
    // Update the existing request with new details and reset status to 'pending'
    const updated = await this.verificationRepository.updateRequestByEmail(email, {
      username,
      degreeCertificateUrl,
      resumeUrl,
      status: 'pending', // reset status for review again
      rejectionReason: undefined, // clear previous rejection reason
      reviewedAt: null, // reset reviewed date
    })

    // If update fails, throw an error
    if (!updated) {
      throw new Error('Failed to update verification request')
    }

    return updated
  }
}
