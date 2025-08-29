import { IAdminMembershipService } from './interfaces/IAdminMembershipService'
import { IAdminMembershipRepository } from '../../repositories/adminRepository/interfaces/IAdminMembershipRepository'
import { IMembershipPlan } from '../../models/membershipPlan.Model'

// Service layer for handling membership plans (used by Admin)
// It connects business logic with the repository (DB operations)
export class AdminMembershipService implements IAdminMembershipService {
  private membershipRepository: IAdminMembershipRepository

  constructor(membershipRepository: IAdminMembershipRepository) {
    // Inject repository to access database operations
    this.membershipRepository = membershipRepository
  }

  // Create a new membership plan (with duplicate name check)
  async createPlan(data: Partial<IMembershipPlan>): Promise<IMembershipPlan> {
    // Check if a plan with the same name already exists (case insensitive)
    const existing = await this.membershipRepository.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') },
    })

    if (existing) {
      throw new Error('Membership plan with this name already exists.')
    }

    // If no duplicate, create the plan
    return this.membershipRepository.createPlan(data)
  }

  // Update an existing membership plan (with duplicate name check)
  async updatePlan(id: string, data: Partial<IMembershipPlan>): Promise<IMembershipPlan | null> {
    if (data.name) {
      // Check if another plan with the same name exists
      const existing = (await this.membershipRepository.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      })) as IMembershipPlan | null

      // If found and it's not the same plan being updated, throw error
      if (existing && existing._id.toString() !== id) {
        throw new Error('Another membership plan with this name already exists.')
      }
    }

    // Update plan details in the repository
    return this.membershipRepository.updatePlan(id, data)
  }

  // Delete a membership plan by ID
  async deletePlan(id: string): Promise<boolean> {
    return this.membershipRepository.deletePlan(id)
  }

  // Get a single membership plan by ID
  async getPlanById(id: string): Promise<IMembershipPlan | null> {
    return this.membershipRepository.getPlanById(id)
  }

  // Get all membership plans
  async getAllPlans(): Promise<IMembershipPlan[]> {
    return this.membershipRepository.getAllPlans()
  }

  // Get membership plans with pagination and optional filter
  async paginatePlans(
    filter: object,
    page: number,
    limit: number,
  ): Promise<{ data: IMembershipPlan[]; total: number }> {
    return this.membershipRepository.paginatePlans(filter, page, limit)
  }

  // Toggle status (activate/deactivate) of a membership plan
  async toggleStatus(id: string): Promise<IMembershipPlan | null> {
    return this.membershipRepository.toggleStatus(id)
  }
}
