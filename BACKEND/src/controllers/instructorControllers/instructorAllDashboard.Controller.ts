import { Response } from 'express'
import { Types } from 'mongoose'
import { IInstructorAllDashboardController } from './interfaces/IInstructorAllDashboardController'
import { IInstructorAllCourseDashboardService } from '../../services/instructorServices/interfaces/IInstructorAllDashboardService'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { ITopSellingCourse } from '../../types/dashboardTypes'
import { generateExcelReport, generatePdfReport } from '../../utils/reportGenerator'

// Controller class for handling all instructor dashboard related operations
export class InstructorAllCourseDashboardController implements IInstructorAllDashboardController {
  private service: IInstructorAllCourseDashboardService

  // Initialize the controller with the required service
  constructor(service: IInstructorAllCourseDashboardService) {
    this.service = service
  }

  // Method to fetch instructor dashboard data
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id // Extract instructor id from authenticated user

      if (!instructorId) {
        // If no user id is found, return unauthorized
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      // Convert instructor id to MongoDB ObjectId
      const instructorObjectId = new Types.ObjectId(instructorId)

      // Fetch dashboard data using the service
      const data = await this.service.getInstructorDashboard(instructorObjectId)

      // Replace course thumbnail URLs with AWS S3 pre-signed URLs
      const topCoursesWithUrls = await Promise.all(
        data.topCourses.map(async (course: ITopSellingCourse) => {
          const signedUrl = await getPresignedUrl(course.thumbnailUrl)
          return {
            ...course,
            thumbnailUrl: signedUrl, // Replace original URL with signed one
          }
        }),
      )

      // Prepare updated response data
      const updatedData = {
        ...data,
        topCourses: topCoursesWithUrls,
      }

      // Send successful response with dashboard data
      res.status(200).json({ success: true, data: updatedData })
    } catch (error: unknown) {
      // Handle unexpected errors
      console.error('Dashboard Error:', error)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  }

  // Method to fetch detailed revenue report with pagination and filters
  async getDetailedRevenueReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id // Instructor id from request

      if (!instructorId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      // Extract query parameters
      const { range, startDate, endDate, page = '1', limit = '5' } = req.query

      // Allowed range values
      const allowed = ['daily', 'weekly', 'monthly', 'yearly', 'custom']
      if (!range || !allowed.includes(range as string)) {
        res.status(400).json({ success: false, message: 'Invalid or missing range' })
        return
      }

      // Convert start and end dates if provided
      const start = startDate ? new Date(startDate as string) : undefined
      const end = endDate ? new Date(endDate as string) : undefined

      // Convert page and limit to numbers
      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)

      // Validate pagination values
      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        res.status(400).json({ success: false, message: 'Invalid page or limit' })
        return
      }

      // Fetch detailed revenue report using the service
      const { data, total } = await this.service.getDetailedRevenueReport(
        new Types.ObjectId(instructorId),
        range as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
        pageNum,
        limitNum,
        start,
        end,
      )

      console.log('report data', data)

      // Send successful response with paginated report data
      res.status(200).json({ success: true, data, total })
    } catch (error) {
      console.error('Detailed revenue report error:', error)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  }

  // Method to export revenue report into PDF or Excel format
  async exportRevenueReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id // Instructor id
      const { range, startDate, endDate, format } = req.query // Query params

      // Validate required parameters
      if (!instructorId || !range || !['pdf', 'excel'].includes(format as string)) {
        res.status(400).json({ success: false, message: 'Missing or invalid parameters' })
        return
      }

      // Fetch all report data without pagination
      const { data } = await this.service.getDetailedRevenueReport(
        new Types.ObjectId(instructorId),
        range as any,
        1, // First page
        10000, // Large limit to fetch all records
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      )

      // Generate report based on requested format
      if (format === 'excel') {
        return generateExcelReport(data, res)
      } else {
        return generatePdfReport(data, res)
      }
    } catch (err) {
      console.error('Export Error:', err)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  }
}
