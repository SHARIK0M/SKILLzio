import { Request, Response } from 'express'
import { IAdminMembershipController } from './interfaces/IAdminMembershipController'
import { IAdminMembershipService } from '../../services/adminServices/interfaces/IAdminMembershipService'
import { MembershipMessages } from '../../types/constants'
import { StatusCode } from '../../types/enums'

// Controller class responsible for handling membership-related API requests
export class AdminMembershipController implements IAdminMembershipController {
  private membershipService: IAdminMembershipService

  // Injects the membership service dependency
  constructor(membershipService: IAdminMembershipService) {
    this.membershipService = membershipService
  }

  // Create a new membership plan
  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await this.membershipService.createPlan(req.body) // Call service to create plan
      res.status(StatusCode.CREATED).json({
        message: MembershipMessages.CREATE_SUCCESS,
        plan,
      })
    } catch (error) {
      res.status(StatusCode.BAD_REQUEST).json({
        message: MembershipMessages.CREATE_FAILURE,
        error: (error as Error).message || 'Unknown error',
      })
    }
  }

  // Update an existing membership plan by ID
  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { membershipId } = req.params // Get plan ID from request params
      const updated = await this.membershipService.updatePlan(membershipId, req.body)

      if (!updated) {
        // If no plan found, return 404
        res.status(StatusCode.NOT_FOUND).json({ message: MembershipMessages.NOT_FOUND })
        return
      }

      res.json({
        message: MembershipMessages.UPDATE_SUCCESS,
        plan: updated,
      })
    } catch (error) {
      res.status(StatusCode.BAD_REQUEST).json({
        message: MembershipMessages.UPDATE_FAILURE,
        error: (error as Error).message || 'Unknown error',
      })
    }
  }

  // Delete a membership plan by ID
  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const { membershipId } = req.params // Extract ID from request
      const deleted = await this.membershipService.deletePlan(membershipId)

      if (!deleted) {
        // If not found, return 404
        res.status(StatusCode.NOT_FOUND).json({ message: MembershipMessages.NOT_FOUND })
        return
      }

      res.json({ message: MembershipMessages.DELETE_SUCCESS })
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: MembershipMessages.DELETE_FAILURE,
        error: (error as Error).message || 'Unknown error',
      })
    }
  }

  // Fetch a single membership plan by ID
  async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { membershipId } = req.params
      const plan = await this.membershipService.getPlanById(membershipId)

      if (!plan) {
        // If no plan found, return 404
        res.status(StatusCode.NOT_FOUND).json({ message: MembershipMessages.NOT_FOUND })
        return
      }

      res.json({
        message: MembershipMessages.FETCH_ONE_SUCCESS,
        plan,
      })
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: MembershipMessages.FETCH_ONE_FAILURE,
        error: (error as Error).message || 'Unknown error',
      })
    }
  }

  // Fetch all membership plans with pagination and search
  async getAllPlans(req: Request, res: Response): Promise<void> {
    try {
      // Extract query params for pagination and search
      const { page = 1, limit = 10, search = '' } = req.query

      // Create filter if search query exists
      const filter =
        search && typeof search === 'string'
          ? { name: { $regex: new RegExp(search, 'i') } } // Case-insensitive search by name
          : {}

      // Fetch paginated data from service
      const { data, total } = await this.membershipService.paginatePlans(
        filter,
        Number(page),
        Number(limit),
      )

      res.json({
        message: MembershipMessages.FETCH_ALL_SUCCESS,
        plans: data,
        total,
        page: Number(page),
        limit: Number(limit),
      })
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: MembershipMessages.FETCH_ALL_FAILURE,
        error: (error as Error).message || 'Unknown error',
      })
    }
  }

  // Toggle the active/inactive status of a membership plan
  async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { membershipId } = req.params
      const updated = await this.membershipService.toggleStatus(membershipId)

      if (!updated) {
        // If no plan found, return 404
        res.status(StatusCode.NOT_FOUND).json({ message: MembershipMessages.NOT_FOUND })
        return
      }

      res.json({
        message: 'Membership plan status updated successfully.',
        plan: updated,
      })
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update membership plan status.',
        error: (error as Error).message || 'Unknown error',
      })
    }
  }
}
