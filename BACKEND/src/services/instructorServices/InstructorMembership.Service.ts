import { IInstructorMembershipService } from './interfaces/IInstructorMembershipService'
import { IInstructorMembershipRepository } from '../../repositories/instructorRepository/interfaces/IInstructorMembershipRepository'
import { IMembershipPlan } from '../../models/membershipPlan.Model'
import { IInstructor } from '../../models/instructor.Model'
import IInstructorRepository from '../../repositories/instructorRepository/interfaces/IInstructorRepository'

// Service class to handle business logic related to Instructor Membership
export class InstructorMembershipService implements IInstructorMembershipService {
  // Repositories used for database operations
  private instructorMembershipRepo: IInstructorMembershipRepository
  private instructorRepo: IInstructorRepository

  // Constructor initializes repositories (dependency injection)
  constructor(
    instructorMembershipRepo: IInstructorMembershipRepository,
    instructorRepo: IInstructorRepository,
  ) {
    this.instructorMembershipRepo = instructorMembershipRepo
    this.instructorRepo = instructorRepo
  }

  // Fetch all active membership plans available for instructors
  async getAvailablePlans(): Promise<IMembershipPlan[]> {
    return await this.instructorMembershipRepo.getActivePlans()
  }

  // Get instructor details by their ID
  async getInstructorById(instructorId: string): Promise<IInstructor | null> {
    return this.instructorRepo.findById(instructorId)
  }

  // Get current membership status of an instructor
  async getMembershipStatus(instructorId: string): Promise<{
    planId: string | null // Current membership plan ID
    expiryDate: Date | null // Expiry date of the membership
    isMentor: boolean // Whether instructor has mentor status
  }> {
    // Fetch instructor data
    const instructor = await this.instructorRepo.findById(instructorId)

    // If instructor is not found, throw an error
    if (!instructor) throw new Error('Instructor not found')

    // Return membership details safely (null if not available)
    return {
      planId: instructor.membershipPlanId?.toString() ?? null,
      expiryDate: instructor.membershipExpiryDate ?? null,
      isMentor: instructor.isMentor,
    }
  }
}
