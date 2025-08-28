import { IInstructorAllCourseDashboardService } from './interfaces/IInstructorAllDashboardService'
import { IInstructorAllCourseDashboardRepository } from '../../repositories/instructorRepository/interfaces/IInstructorAllCourseDashboardRepository'
import { Types } from 'mongoose'

// Service class responsible for handling instructor's course dashboard-related operations
export class InstructorAllCourseDashboardService implements IInstructorAllCourseDashboardService {
  constructor(
    private dashboardRepo: IInstructorAllCourseDashboardRepository, // Repository dependency (injected)
  ) {}

  /**
   * Fetch the complete dashboard data for a specific instructor
   * Includes top-selling courses, category-wise sales, monthly sales graph,
   * total revenue, and total course sales.
   */
  async getInstructorDashboard(instructorId: Types.ObjectId): Promise<any> {
    // Run all queries in parallel to optimize performance
    const [topCourses, categorySales, monthlySales, totalRevenue, totalCourseSales] =
      await Promise.all([
        this.dashboardRepo.getTopSellingCourses(instructorId), // Get best performing courses
        this.dashboardRepo.getCategoryWiseSales(instructorId), // Sales data grouped by category
        this.dashboardRepo.getMonthlySalesGraph(instructorId), // Monthly sales graph data
        this.dashboardRepo.getTotalRevenue(instructorId), // Total revenue earned
        this.dashboardRepo.getTotalCourseSales(instructorId), // Total number of course sales
      ])

    // Return consolidated dashboard response
    return {
      topCourses,
      categorySales,
      monthlySales,
      totalRevenue,
      totalCourseSales,
    }
  }

  /**
   * Get a detailed revenue report for the instructor
   * - Supports different ranges (daily, weekly, monthly, yearly, custom)
   * - Supports pagination (page, limit)
   * - Can filter between startDate and endDate if provided
   */
  async getDetailedRevenueReport(
    instructorId: Types.ObjectId,
    range: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: any[]; total: number }> {
    return this.dashboardRepo.getDetailedRevenueReport(
      instructorId,
      range,
      page,
      limit,
      startDate,
      endDate,
    )
  }
}
