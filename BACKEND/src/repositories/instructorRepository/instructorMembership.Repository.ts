import { IInstructorMembershipRepository } from './interfaces/IInstructorMembershipRepository'
import { IMembershipPlan, MembershipPlanModel } from '../../models/membershipPlan.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'

// Repository class to manage instructor membership plans
export class InstructorMembershipRepository
  extends GenericRepository<IMembershipPlan>
  implements IInstructorMembershipRepository
{
  constructor() {
    // Pass the MembershipPlan model to the generic repository
    super(MembershipPlanModel)
  }

  // Get all membership plans that are currently active
  async getActivePlans() {
    return await this.findAll({ isActive: true })
  }

  // Find a membership plan by its unique ID
  async findById(id: string): Promise<IMembershipPlan | null> {
    return await super.findById(id)
  }
}
