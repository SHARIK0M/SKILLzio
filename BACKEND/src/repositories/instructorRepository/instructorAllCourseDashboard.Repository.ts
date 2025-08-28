import { Types } from 'mongoose'
import { IInstructorAllCourseDashboardRepository } from './interfaces/IInstructorAllCourseDashboardRepository'
import { IGenericRepository } from '../genericRepo/generic.Repository'
import { IOrder } from '../../models/order.Model'
import { ITopSellingCourse, ICategorySales, IMonthlySales } from '../../types/dashboardTypes'

// Repository class for fetching instructor dashboard data across all courses
export class InstructorAllCourseDashboardRepository
  implements IInstructorAllCourseDashboardRepository
{
  private orderRepo: IGenericRepository<IOrder>

  constructor(orderRepo: IGenericRepository<IOrder>) {
    this.orderRepo = orderRepo
  }

  // Fetch top 3 selling courses for a specific instructor
  async getTopSellingCourses(instructorId: Types.ObjectId): Promise<ITopSellingCourse[]> {
    return this.orderRepo.aggregate<ITopSellingCourse>([
      { $match: { status: 'SUCCESS' } }, // Only successful orders
      { $unwind: '$courses' }, // Break down array of courses
      {
        $lookup: {
          // Join with courses collection
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' }, // Extract course details
      { $match: { 'courseInfo.instructorId': instructorId } }, // Filter by instructor
      {
        $group: {
          // Group by course and count sales
          _id: '$courses',
          courseName: { $first: '$courseInfo.courseName' },
          thumbnailUrl: { $first: '$courseInfo.thumbnailUrl' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // Sort by sales count (descending)
      { $limit: 3 }, // Limit to top 3
    ])
  }

  // Get category-wise sales data for instructor courses
  async getCategoryWiseSales(instructorId: Types.ObjectId): Promise<ICategorySales[]> {
    return this.orderRepo.aggregate<ICategorySales>([
      { $match: { status: 'SUCCESS' } }, // Only successful orders
      { $unwind: '$courses' },
      {
        $lookup: {
          // Join with courses collection
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.instructorId': instructorId } }, // Filter courses owned by instructor
      {
        $group: {
          // Group by category and count sales
          _id: '$courseInfo.category',
          totalSales: { $sum: 1 },
        },
      },
      {
        $lookup: {
          // Join with categories collection for category name
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $project: {
          // Shape final output
          categoryName: { $arrayElemAt: ['$categoryInfo.categoryName', 0] },
          totalSales: 1,
        },
      },
      { $sort: { totalSales: -1 } }, // Sort categories by sales count
    ])
  }

  // Get monthly sales graph data (total revenue and sales count per month)
  async getMonthlySalesGraph(instructorId: Types.ObjectId): Promise<IMonthlySales[]> {
    return this.orderRepo.aggregate<IMonthlySales>([
      { $match: { status: 'SUCCESS' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.instructorId': instructorId } },
      {
        $group: {
          // Group by year and month
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: {
            $sum: { $multiply: ['$courseInfo.price', 0.9] }, // Instructor earns 90% of price
          },
          totalSales: { $sum: 1 },
        },
      },
      {
        $project: {
          // Format response
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
          totalSales: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } }, // Sort chronologically
    ])
  }

  // Calculate total revenue earned by instructor across all courses
  async getTotalRevenue(instructorId: Types.ObjectId): Promise<number> {
    const result = await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.instructorId': instructorId } },
      {
        $group: {
          // Sum up instructor’s 90% share
          _id: null,
          total: { $sum: { $multiply: ['$courseInfo.price', 0.9] } },
        },
      },
    ])
    return result[0]?.total || 0
  }

  // Count total number of sales across all instructor’s courses
  async getTotalCourseSales(instructorId: Types.ObjectId): Promise<number> {
    const result = await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.instructorId': instructorId } },
      { $count: 'totalSales' }, // Count total sales
    ])
    return result[0]?.totalSales || 0
  }

  // Generate detailed revenue report for a given date range (paginated)
  async getDetailedRevenueReport(
    instructorId: Types.ObjectId,
    range: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: any[]; total: number }> {
    const now = new Date()
    let start: Date
    let end: Date = now

    // Set start and end dates based on the selected range
    switch (range) {
      case 'daily':
        start = new Date()
        start.setHours(0, 0, 0, 0)
        end = new Date()
        end.setHours(23, 59, 59, 999)
        break
      case 'weekly':
        start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start and end date required for custom range')
        }
        start = new Date(startDate)
        end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        break
      default:
        throw new Error('Invalid range')
    }

    // Filter orders within the date range
    const matchStage = {
      status: 'SUCCESS',
      createdAt: { $gte: start, $lte: end },
    }

    // Aggregation for paginated detailed data
    const dataAggregation = await this.orderRepo.aggregate([
      { $match: matchStage },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      {
        $match: { 'courseInfo.instructorId': instructorId },
      },
      {
        $lookup: {
          // Join with payments collection
          from: 'payments',
          localField: '_id',
          foreignField: 'orderId',
          as: 'paymentInfo',
        },
      },
      {
        $unwind: { path: '$paymentInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          // Shape the report
          createdAt: 1,
          orderId: '$_id',
          paymentMethod: { $ifNull: ['$paymentInfo.method', 'N/A'] },
          courseName: '$courseInfo.courseName',
          coursePrice: '$courseInfo.price',
          instructorEarning: { $multiply: ['$courseInfo.price', 0.9] },
          totalOrderAmount: '$amount',
        },
      },
      { $sort: { createdAt: -1 } }, // Latest first
      { $skip: (page - 1) * limit }, // Pagination skip
      { $limit: limit }, // Pagination limit
    ])

    // Aggregation for total record count (for pagination metadata)
    const countAggregation = await this.orderRepo.aggregate([
      { $match: matchStage },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: '$courseInfo' },
      { $match: { 'courseInfo.instructorId': instructorId } },
      { $count: 'total' },
    ])

    const total = countAggregation[0]?.total || 0

    return { data: dataAggregation, total }
  }
}
