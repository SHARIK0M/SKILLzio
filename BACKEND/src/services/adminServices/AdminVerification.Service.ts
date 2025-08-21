import { IAdminVerificationService } from './interfaces/IAdminVerificationService'
import { IVerificationModel } from '../../models/verification.Model'
import { IAdminVerificationRepository } from '../../repositories/adminRepository/interfaces/IAdminVerificationRepository'
import IInstructorService from '../instructorServices/interfaces/IInstructorService'

// Service class that handles all verification-related logic for instructors (used by Admin)
export class AdminVerificationService implements IAdminVerificationService {
  private verificationRepository: IAdminVerificationRepository // Repository for verification data (DB operations)
  private instructorService: IInstructorService // Service to update instructor status (verified/unverified)

  constructor(
    verificationRepository: IAdminVerificationRepository,
    instructorService: IInstructorService,
  ) {
    this.verificationRepository = verificationRepository
    this.instructorService = instructorService
  }

  // Fetch all verification requests with pagination and optional search
  async getAllRequests(
    page: number,
    limit: number,
    search = '',
  ): Promise<{ data: IVerificationModel[]; total: number }> {
    return await this.verificationRepository.getAllRequests(page, limit, search)
  }

  // Get details of a specific verification request by instructor email
  async getRequestDataByEmail(email: string): Promise<IVerificationModel | null> {
    return await this.verificationRepository.getRequestDataByEmail(email)
  }

  // Approve or reject a verification request
  // - If approved, mark instructor as verified in the system
  // - If rejected, optionally provide a reason
  async approveRequest(
    email: string,
    status: string,
    reason?: string,
  ): Promise<IVerificationModel | null> {
    try {
      // Update verification request status in the database
      const result = await this.verificationRepository.approveRequest(email, status, reason)

      // If request is approved, update the instructor's profile as verified
      if (result && status === 'approved') {
        await this.instructorService.setInstructorVerified(email)
      }

      return result
    } catch (error) {
      throw error // Re-throw error for higher-level handling
    }
  }
}
