import { IVerificationModel } from '../../models/verification.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import VerificationModel from '../../models/verification.Model'
import { IAdminVerificationRepository } from './interfaces/IAdminVerificationRepository'
import { InstructorErrorMessages } from '../../types/constants'
import type { SortOrder } from 'mongoose'

// Repository class for handling admin-related verification requests
export class AdminVerificationRepository
  extends GenericRepository<IVerificationModel>
  implements IAdminVerificationRepository
{
  constructor() {
    // Call the parent GenericRepository with the VerificationModel
    super(VerificationModel)
  }

  /**
   * Fetch all verification requests with pagination, search, and sorting.
   * @param page - Current page number
   * @param limit - Number of records per page
   * @param search - Optional search keyword (matches username or email)
   * @returns Paginated verification requests and total count
   */
  async getAllRequests(
    page: number,
    limit: number,
    search: string = '',
  ): Promise<{ data: IVerificationModel[]; total: number }> {
    try {
      // Build filter query based on search keyword
      const filter = search
        ? {
            $or: [
              { username: { $regex: new RegExp(search, 'i') } },
              { email: { $regex: new RegExp(search, 'i') } },
            ],
          }
        : {}

      // Sort by creation date in descending order
      const sort: Record<string, SortOrder> = { createdAt: -1 }

      // Use generic paginate method for pagination + sorting
      return await this.paginate(filter, page, limit, sort)
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetch a single verification request by email.
   * @param email - Instructor email
   * @returns Verification request document or null
   */
  async getRequestDataByEmail(email: string): Promise<IVerificationModel | null> {
    try {
      return await this.findOne({ email })
    } catch (error) {
      throw error
    }
  }

  /**
   * Approve or reject a verification request.
   * @param email - Instructor email
   * @param status - New status ("approved" or "rejected")
   * @param reason - Optional rejection reason (only if status is rejected)
   * @returns Updated verification request document
   */
  async approveRequest(
    email: string,
    status: string,
    reason?: string,
  ): Promise<IVerificationModel | null> {
    try {
      // Find the verification request by instructor email
      const instructor = await this.findOne({ email })
      if (!instructor) throw new Error(InstructorErrorMessages.INSTRUCTOR_NOT_FOUND)

      // Extract instructor ID from the document
      const instructorId = instructor._id as unknown as string

      // Build update payload
      const updateData: Partial<IVerificationModel> = {
        status,
        reviewedAt: new Date(),
        rejectionReason: status === 'rejected' ? reason : undefined,
      }

      // Update the verification request by ID
      return await this.update(instructorId, updateData)
    } catch (error) {
      throw error
    }
  }
}
