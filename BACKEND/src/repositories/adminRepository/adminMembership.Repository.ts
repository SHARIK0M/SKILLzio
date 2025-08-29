import { IAdminMembershipRepository } from './interfaces/IAdminMembershipRepository'
import { MembershipPlanModel, IMembershipPlan } from '../../models/membershipPlan.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'

export class AdminMembershipRepository
  extends GenericRepository<IMembershipPlan>
  implements IAdminMembershipRepository
{
  constructor() {
    // Call parent constructor with MembershipPlan model
    super(MembershipPlanModel)
  }

  // Create a new membership plan
  async createPlan(planData: Partial<IMembershipPlan>): Promise<IMembershipPlan> {
    return this.create(planData)
  }

  // Update an existing membership plan by ID
  async updatePlan(
    id: string,
    updateData: Partial<IMembershipPlan>,
  ): Promise<IMembershipPlan | null> {
    return this.update(id, updateData)
  }

  // Delete a membership plan by ID
  async deletePlan(id: string): Promise<boolean> {
    const deleted = await this.delete(id)
    return deleted !== null
  }

  // Get a single membership plan by ID
  async getPlanById(id: string): Promise<IMembershipPlan | null> {
    return this.findById(id)
  }

  // Get all membership plans (sorted by creation date in descending order)
  async getAllPlans(): Promise<IMembershipPlan[]> {
    const plans = await this.findAll({}, undefined, { createdAt: -1 })
    return plans || []
  }

  // Get paginated list of membership plans with filters and sorting
  async paginatePlans(
    filter: object,
    page: number,
    limit: number,
    sort: Record<string, any> = { createdAt: -1 },
  ): Promise<{ data: IMembershipPlan[]; total: number }> {
    return this.paginate(filter, page, limit, sort)
  }

  // Toggle membership plan status (active/inactive)
  async toggleStatus(id: string): Promise<IMembershipPlan | null> {
    const plan = await this.findById(id)
    if (!plan) return null

    return this.update(id, { isActive: !plan.isActive })
  }
}
