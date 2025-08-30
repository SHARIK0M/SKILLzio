import { IStudentInstructorListingController } from './interfaces/IStudentInstructorListingController'
import { IStudentInstructorListingService } from '../../services/studentServices/interfaces/IStudentInstructorListingService'
import { Request, Response } from 'express'
import { StatusCode } from '../../types/enums'

// Controller class to handle instructor listing features for students
export class StudentInstructorListingController implements IStudentInstructorListingController {
  private instructorListingService: IStudentInstructorListingService

  // Injecting the service dependency
  constructor(service: IStudentInstructorListingService) {
    this.instructorListingService = service
  }

  // API to fetch paginated list of mentors with filters (page, limit, search, sort, skill, expertise)
  async listMentors(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1 // Default page = 1
      const limit = parseInt(req.query.limit as string) || 9 // Default limit = 9
      const search = req.query.search as string | undefined // Search by name/keyword
      const sort = (req.query.sort as 'asc' | 'desc') || 'asc' // Default sort order = ascending
      const skill = req.query.skill as string | undefined // Filter by skill
      const expertise = req.query.expertise as string | undefined // Filter by expertise

      // Get mentors from service with applied filters
      const result = await this.instructorListingService.getPaginatedMentors(
        page,
        limit,
        search,
        sort,
        skill,
        expertise,
      )

      // Success response with data
      res.status(StatusCode.OK).json({ success: true, ...result })
    } catch (error) {
      console.error(error)
      // Internal server error response
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch instructors',
      })
    }
  }

  // API to fetch mentor details by ID
  async getMentorById(req: Request, res: Response): Promise<void> {
    try {
      const { instructorId } = req.params

      // Fetch mentor details from service
      const mentor = await this.instructorListingService.getMentorById(instructorId)

      // If mentor not found, send 404 response
      if (!mentor) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Instructor not found',
        })
        return
      }

      // Success response with mentor details
      res.status(StatusCode.OK).json({ success: true, data: mentor })
    } catch (error) {
      // Internal server error response
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch instructor details',
      })
    }
  }

  // API to fetch available filters (skills, expertise, etc.)
  async getAvailableFilters(_req: Request, res: Response): Promise<void> {
    try {
      // Get filters from service
      const filters = await this.instructorListingService.getAvailableFilters()
      console.log('filters', filters)

      // Success response with filter options
      res.status(StatusCode.OK).json({ success: true, ...filters })
    } catch (error) {
      console.log(error)
      // Internal server error response
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch filter options',
      })
    }
  }
}
