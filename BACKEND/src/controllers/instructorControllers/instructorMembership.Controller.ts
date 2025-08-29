import { Request, Response } from 'express'
import { IInstructorMembershipController } from './interfaces/IInstructorMembershipController'
import { IInstructorMembershipService } from '../../services/instructorServices/interfaces/IInstructorMembershipService'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { StatusCode } from '../../types/enums'

// Controller responsible for handling instructor membership related requests
export class InstructorMembershipController implements IInstructorMembershipController {
  // Inject the instructor membership service through constructor
  constructor(private readonly service: IInstructorMembershipService) {}

  // Fetch all available membership plans for instructors
  async getPlans(_req: Request, res: Response): Promise<void> {
    try {
      // Call service to get membership plans
      const plans = await this.service.getAvailablePlans()

      // Return the list of plans with status 200
      res.status(StatusCode.OK).json(plans)
    } catch (err) {
      // Log error and send 500 response
      console.error('Error fetching membership plans:', err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong.' })
    }
  }

  // Get the current membership/mentor status of the authenticated instructor
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract instructor ID from authenticated user
      const instructorId = req.user?.id

      // If no instructor ID is found, return unauthorized
      if (!instructorId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' })
        return
      }

      // Fetch instructor details using the ID
      const instructor = await this.service.getInstructorById(instructorId)

      // If instructor does not exist, return not found
      if (!instructor) {
        res.status(StatusCode.NOT_FOUND).json({ message: 'Instructor not found' })
        return
      }

      // Return instructor mentor status (true/false)
      res.status(StatusCode.OK).json({ isMentor: instructor.isMentor })
    } catch (err) {
      // Log error and send 500 response
      console.error('Error getting mentor status:', err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong.' })
    }
  }

  // Get the currently active membership of the authenticated instructor
  async getActiveMembership(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract instructor ID from authenticated user
      const instructorId = req.user?.id

      // If no instructor ID is found, return unauthorized
      if (!instructorId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' })
        return
      }

      // Fetch active membership status from service
      const status = await this.service.getMembershipStatus(instructorId)

      // Return active membership details
      res.status(StatusCode.OK).json(status)
    } catch (err) {
      // Log error and send 500 response
      console.error('Error fetching membership status:', err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' })
    }
  }
}
