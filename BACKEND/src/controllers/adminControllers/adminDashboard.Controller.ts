import { Request, Response } from 'express'
import { IAdminDashboardController } from './interfaces/IAdminDashboardController'
import { IAdminDashboardService } from '../../services/adminServices/interfaces/IAdminDashboardService'
import { FilterType } from '../../types/dashboardTypes'
import {
  generateCourseSalesPdfReport,
  generateCourseSalesExcelReport,
  generateMembershipSalesPdfReport,
  generateMembershipSalesExcelReport,
} from '../../utils/adminReportGenerator'

// Controller class for handling all admin dashboard-related requests
export class AdminDashboardController implements IAdminDashboardController {
  constructor(private readonly dashboardService: IAdminDashboardService) {}

  // Fetch overall dashboard metrics (revenue, sales count, etc.)
  async getDashboardData(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.dashboardService.getDashboardMetrics()
      res.status(200).json({ success: true, data })
    } catch (error) {
      console.error('AdminDashboardController Error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Get paginated course sales report (daily, weekly, monthly, custom)
  async getCourseSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate, page, limit } = req.query

      // Validate type parameter
      if (typeof type !== 'string' || !['daily', 'weekly', 'monthly', 'custom'].includes(type)) {
        res.status(400).json({ success: false, message: 'Invalid type parameter' })
        return
      }

      // Build filter object
      const filter = {
        type: type as FilterType,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }

      // Validate pagination inputs
      const pageNum = page ? parseInt(page as string, 10) : undefined
      const limitNum = limit ? parseInt(limit as string, 10) : undefined

      if (pageNum && (isNaN(pageNum) || pageNum < 1)) {
        res.status(400).json({ success: false, message: 'Invalid page number' })
        return
      }
      if (limitNum && (isNaN(limitNum) || limitNum < 1)) {
        res.status(400).json({ success: false, message: 'Invalid limit number' })
        return
      }

      // Fetch course sales report from service
      const { items, totalAdminShare, totalItems, totalPages, currentPage } =
        await this.dashboardService.getCourseSalesReport(filter, pageNum, limitNum)

      res.status(200).json({
        success: true,
        data: items,
        adminShare: totalAdminShare,
        totalItems,
        totalPages,
        currentPage,
      })
    } catch (error) {
      console.error('CourseSalesReport Error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Get paginated membership sales report (daily, weekly, monthly, custom)
  async getMembershipSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate, page, limit } = req.query

      // Validate type parameter
      if (typeof type !== 'string' || !['daily', 'weekly', 'monthly', 'custom'].includes(type)) {
        res.status(400).json({ success: false, message: 'Invalid type parameter' })
        return
      }

      // Build filter object
      const filter = {
        type: type as FilterType,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }

      // Validate pagination inputs
      const pageNum = page ? parseInt(page as string, 10) : undefined
      const limitNum = limit ? parseInt(limit as string, 10) : undefined

      if (pageNum && (isNaN(pageNum) || pageNum < 1)) {
        res.status(400).json({ success: false, message: 'Invalid page number' })
        return
      }
      if (limitNum && (isNaN(limitNum) || limitNum < 1)) {
        res.status(400).json({ success: false, message: 'Invalid limit number' })
        return
      }

      // Fetch membership sales report from service
      const { items, totalRevenue, totalSales, totalItems, totalPages, currentPage } =
        await this.dashboardService.getMembershipSalesReport(filter, pageNum, limitNum)

      res.status(200).json({
        success: true,
        data: items,
        totalRevenue,
        totalSales,
        totalItems,
        totalPages,
        currentPage,
      })
    } catch (error) {
      console.error('MembershipSalesReport Error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Export course sales report in Excel or PDF format
  async exportCourseSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate, format } = req.query

      // Validate type parameter
      if (typeof type !== 'string' || !['daily', 'weekly', 'monthly', 'custom'].includes(type)) {
        res.status(400).json({ success: false, message: 'Invalid type parameter' })
        return
      }

      // Validate format parameter
      if (typeof format !== 'string' || !['excel', 'pdf'].includes(format)) {
        res.status(400).json({ success: false, message: 'Invalid format parameter' })
        return
      }

      // Build filter object
      const filter = {
        type: type as FilterType,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }

      // Fetch course sales data without pagination (full export)
      const { items, totalAdminShare } = await this.dashboardService.getCourseSalesReport(filter)

      // Export based on chosen format
      if (format === 'excel') {
        await generateCourseSalesExcelReport(items, totalAdminShare, res)
      } else {
        await generateCourseSalesPdfReport(items, totalAdminShare, res)
      }
    } catch (error) {
      console.error('ExportCourseSalesReport Error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }

  // Export membership sales report in Excel or PDF format
  async exportMembershipSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate, format } = req.query

      // Validate type parameter
      if (typeof type !== 'string' || !['daily', 'weekly', 'monthly', 'custom'].includes(type)) {
        res.status(400).json({ success: false, message: 'Invalid type parameter' })
        return
      }

      // Validate format parameter
      if (typeof format !== 'string' || !['excel', 'pdf'].includes(format)) {
        res.status(400).json({ success: false, message: 'Invalid format parameter' })
        return
      }

      // Build filter object
      const filter = {
        type: type as FilterType,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }

      // Fetch membership sales data without pagination (full export)
      const { items } = await this.dashboardService.getMembershipSalesReport(filter)

      // Export based on chosen format
      if (format === 'excel') {
        await generateMembershipSalesExcelReport(items, res)
      } else {
        await generateMembershipSalesPdfReport(items, res)
      }
    } catch (error) {
      console.error('ExportMembershipSalesReport Error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
