import { IAdminDashboardService } from './interfaces/IAdminDashboardService'
import { IAdminDashboardRepository } from '../../repositories/adminRepository/interfaces/IAdminDashboardRepository'
import { IAdminCourseSalesReportItem } from '../../types/dashboardTypes'

// Service class that handles admin dashboard logic
export class AdminDashboardService implements IAdminDashboardService {
  // Inject repository dependency
  constructor(private readonly dashboardRepo: IAdminDashboardRepository) {}

  // Fetch all dashboard metrics at once
  async getDashboardMetrics() {
    // Run multiple repository calls in parallel for better performance
    const [
      instructorCount,
      mentorCount,
      courseCount,
      courseRevenue,
      membershipRevenue,
      courseSalesGraph,
      membershipSalesGraph,
      topCourses,
      topCategories,
    ] = await Promise.all([
      this.dashboardRepo.getInstructorCount(),
      this.dashboardRepo.getMentorCount(),
      this.dashboardRepo.getCourseCount(),
      this.dashboardRepo.getTotalCourseRevenue(),
      this.dashboardRepo.getTotalMembershipRevenue(),
      this.dashboardRepo.getMonthlyCourseSales(),
      this.dashboardRepo.getMonthlyMembershipSales(),
      this.dashboardRepo.getTopSellingCourses(),
      this.dashboardRepo.getTopSellingCategories(),
    ])

    // Return all metrics together in one object
    return {
      instructorCount,
      mentorCount,
      courseCount,
      courseRevenue,
      membershipRevenue,
      courseSalesGraph,
      membershipSalesGraph,
      topCourses,
      topCategories,
    }
  }

  // Generate course sales report with pagination and filters
  async getCourseSalesReport(
    filter: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom'
      startDate?: Date
      endDate?: Date
    },
    page?: number,
    limit?: number,
  ): Promise<{
    items: IAdminCourseSalesReportItem[]
    totalAdminShare: number
    totalItems: number
    totalPages: number
    currentPage: number
  }> {
    // Fetch paginated items for the given filter
    const { items, totalItems } = await this.dashboardRepo.getCourseSalesReportFiltered(
      filter,
      page,
      limit,
    )

    // Calculate totalAdminShare across all records (ignoring pagination)
    const allItemsForTotal = await this.dashboardRepo.getCourseSalesReportFiltered(filter)
    const totalAdminShare = allItemsForTotal.items.reduce(
      (acc, item) => acc + (item.totalAdminShare || 0),
      0,
    )

    // Use default values for pagination if not provided
    const calculatedLimit = limit || 10
    const calculatedPage = page || 1
    const totalPages = Math.ceil(totalItems / calculatedLimit)

    // Return structured response with pagination and totals
    return {
      items,
      totalAdminShare,
      totalItems,
      totalPages,
      currentPage: calculatedPage,
    }
  }

  // Generate membership sales report with pagination and filters
  async getMembershipSalesReport(
    filter: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom'
      startDate?: Date
      endDate?: Date
    },
    page?: number,
    limit?: number,
  ): Promise<{
    items: {
      orderId: string
      planName: string
      instructorName: string
      date: Date
      price: number
    }[]
    totalRevenue: number
    totalSales: number
    totalItems: number
    totalPages: number
    currentPage: number
  }> {
    // Fetch paginated items for the given filter
    const { items, totalItems } = await this.dashboardRepo.getMembershipSalesReportFiltered(
      filter,
      page,
      limit,
    )

    // Calculate total revenue across all records (ignoring pagination)
    const allItemsForTotal = await this.dashboardRepo.getMembershipSalesReportFiltered(filter)
    const totalRevenue = allItemsForTotal.items.reduce((acc, item) => acc + item.price, 0)

    // Total number of sales should represent all sales, not just the page size
    const totalSales = totalItems

    // Use default values for pagination if not provided
    const calculatedLimit = limit || 10
    const calculatedPage = page || 1
    const totalPages = Math.ceil(totalItems / calculatedLimit)

    // Return structured response with pagination and totals
    return {
      items,
      totalRevenue,
      totalSales,
      totalItems,
      totalPages,
      currentPage: calculatedPage,
    }
  }
}
