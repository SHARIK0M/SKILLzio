import { IAdminCourseController } from './interfaces/IAdminCourseControllet'
import { IAdminCourseService } from '../../services/adminServices/interfaces/IAdminCourseService'
import { Request, Response } from 'express'

// Controller class to handle Admin-related course actions
export class AdminCourseController implements IAdminCourseController {
  constructor(private readonly adminCourseService: IAdminCourseService) {}

  // Fetch all courses with pagination and optional search filter
  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      // Extract query params (default values if not provided)
      const { search = '', page = '1', limit = '10' } = req.query

      // Parse query params into integers
      const parsedPage = parseInt(page as string, 10) || 1
      const parsedLimit = parseInt(limit as string, 10) || 10

      // Call service to fetch paginated courses
      const result = await this.adminCourseService.fetchAllCourses(
        search as string,
        parsedPage,
        parsedLimit,
      )

      // Return response with data and pagination info
      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: parsedPage,
        limit: parsedLimit,
      })
    } catch (error) {
      console.error('Error fetching courses:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Fetch details of a single course by its ID
  async getCourseDetails(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params

      // Call service to get course details
      const result = await this.adminCourseService.getCourseDetails(courseId)

      console.log('result', result)

      // If course not found, send 404 response
      if (!result.course) {
        res.status(404).json({ success: false, message: 'Course not found' })
        return
      }

      // Return course details
      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('Error fetching course details:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Toggle the listing status (list/unlist) of a course
  async updateListingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params

      // Call service to toggle course listing
      const updatedCourse = await this.adminCourseService.toggleCourseListing(courseId)

      // If course not found, send 404 response
      if (!updatedCourse) {
        res.status(404).json({ success: false, message: 'Course not found' })
        return
      }

      // Prepare message based on new status
      const message = updatedCourse.isListed
        ? 'Course listed successfully'
        : 'Course unlisted successfully'

      // Send success response with updated course
      res.status(200).json({ success: true, message, data: updatedCourse })
    } catch (error) {
      console.error('Error toggling listing status:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Toggle the verification status (verify/unverify) of a course
  async toggleVerificationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params

      // Call service to toggle course verification
      const updatedCourse = await this.adminCourseService.toggleCourseVerification(courseId)

      // If course not found, send 404 response
      if (!updatedCourse) {
        res.status(404).json({ success: false, message: 'Course not found' })
        return
      }

      // Prepare message based on new verification status
      const message = updatedCourse.isVerified
        ? 'Course verified and listed successfully'
        : 'Course unverified and unlisted'

      // Send success response with updated course
      res.status(200).json({ success: true, message, data: updatedCourse })
    } catch (error) {
      console.error('Error toggling verification status:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
