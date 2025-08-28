import { Request, Response } from 'express'
import { IInstructorCourseSpecificDashboardController } from './interfaces/IInstructorSpecificCourseController'
import { IInstructorSpecificCourseDashboardService } from '../../services/instructorServices/interfaces/IInstructorSpecificCourseService'
import { Types } from 'mongoose'
import { StatusCode } from '../../types/enums'
import { generatePdfReport, generateExcelReport } from '../../utils/specificReportGenerator'

// Controller class for Instructor's Course-Specific Dashboard operations
export class InstructorSpecificCourseDashboardController
  implements IInstructorCourseSpecificDashboardController
{
  constructor(private dashboardService: IInstructorSpecificCourseDashboardService) {}

  // Get course dashboard data by courseId
  async getCourseDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params

      // Validate courseId
      if (!Types.ObjectId.isValid(courseId)) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid Course ID' })
        return
      }

      // Fetch course dashboard details from service
      const data = await this.dashboardService.getCourseDashboard(new Types.ObjectId(courseId))

      // Send response with data
      res.status(StatusCode.OK).json({ success: true, data })
    } catch (error) {
      console.error('[InstructorSpecificCourseDashboardController] Error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch course dashboard',
      })
    }
  }

  // Get course revenue report with filters, pagination, and date range
  async getCourseRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params
      const { range, startDate, endDate, page, limit } = req.query

      // Validate courseId
      if (!Types.ObjectId.isValid(courseId)) {
        res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid Course ID' })
        return
      }

      // Validate range type
      const allowedRanges = ['daily', 'weekly', 'monthly', 'yearly', 'custom']
      if (!range || !allowedRanges.includes(range as string)) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: 'Invalid or missing range type' })
        return
      }

      // Parse pagination parameters with defaults
      const pageNum = parseInt(page as string) || 1
      const limitNum = parseInt(limit as string) || 5

      // Validate pagination values
      if (pageNum < 1 || limitNum < 1) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: 'Invalid page or limit' })
        return
      }

      // Convert startDate and endDate into Date objects if provided
      const start = startDate ? new Date(startDate as string) : undefined
      const end = endDate ? new Date(endDate as string) : undefined

      // Get revenue report data from service
      const { data, total } = await this.dashboardService.getCourseRevenueReport(
        new Types.ObjectId(courseId),
        range as any,
        pageNum,
        limitNum,
        start,
        end,
      )

      // Send response with report data and total count
      res.status(StatusCode.OK).json({ success: true, data, total })
    } catch (error) {
      console.error('[InstructorSpecificCourseDashboardController] Report Error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch course revenue report',
      })
    }
  }

  // Export course revenue report as PDF or Excel
  async exportCourseRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params
      const { range, startDate, endDate, format } = req.query

      // Validate courseId
      if (!Types.ObjectId.isValid(courseId)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid Course ID',
        })
        return
      }

      // Validate range type
      const allowedRanges = ['daily', 'weekly', 'monthly', 'yearly', 'custom']
      if (!range || !allowedRanges.includes(range as string)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid or missing range type',
        })
        return
      }

      // Validate format (pdf or excel)
      if (!['pdf', 'excel'].includes(format as string)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Format must be either 'pdf' or 'excel'",
        })
        return
      }

      // Convert startDate and endDate into Date objects if provided
      const start = startDate ? new Date(startDate as string) : undefined
      const end = endDate ? new Date(endDate as string) : undefined

      // Fetch all revenue data (no pagination for export)
      const rawData = await this.dashboardService.getCourseRevenueReport(
        new Types.ObjectId(courseId),
        range as any,
        1, // Page is irrelevant for export
        10000, // Fetch large number of records for export
        start,
        end,
      )

      // Transform raw data into required format for reports
      const reportData = rawData.data.map((item) => ({
        orderId: item.orderId,
        createdAt: item.purchaseDate,
        courseName: item.courseName,
        coursePrice: item.coursePrice,
        instructorEarning: item.instructorRevenue,
        totalEnrollments: item.totalEnrollments,
      }))

      // Generate and send report in requested format
      if (format === 'pdf') {
        await generatePdfReport(reportData, res)
      } else {
        await generateExcelReport(reportData, res)
      }
    } catch (error) {
      console.error('[InstructorSpecificCourseDashboardController] Export Error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to export revenue report',
      })
    }
  }
}
