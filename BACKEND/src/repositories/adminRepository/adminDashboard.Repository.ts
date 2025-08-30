import { IAdminDashboardRepository } from './interfaces/IAdminDashboardRepository'
import { CourseRepository } from '../genericRepo/Course.Repository'
import { OrderRepository } from '../genericRepo/Order.Repository'
import { InstructorMembershipOrder } from '../genericRepo/InstructorMemberShirpOrder.Repository'
import IInstructorRepository from '../instructorRepository/interfaces/IInstructorRepository'
import { IAdminCourseSalesReportItem, IAdminMembershipReportItem } from '../../types/dashboardTypes'
import { PipelineStage } from 'mongoose' // Mongoose PipelineStage type for aggregation

// Repository that handles all admin dashboard data fetching and reporting
export class AdminDashboardRepository implements IAdminDashboardRepository {
  constructor(
    private instructorRepo: IInstructorRepository,
    private courseRepo: CourseRepository,
    private orderRepo: OrderRepository,
    private membershipOrderRepo: InstructorMembershipOrder,
  ) {}

  // Get total number of instructors
  async getInstructorCount(): Promise<number> {
    return await this.instructorRepo.getInstructorCount()
  }

  // Get total number of mentors
  async getMentorCount(): Promise<number> {
    return await this.instructorRepo.getMentorCount()
  }

  // Get total number of courses
  async getCourseCount(): Promise<number> {
    return await this.courseRepo.countDocuments({})
  }

  // Calculate total course revenue (admin gets 10% commission)
  async getTotalCourseRevenue(): Promise<number> {
    const result = await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    const totalRevenue = result[0]?.total || 0
    return totalRevenue * 0.1
  }

  // Calculate total membership revenue
  async getTotalMembershipRevenue(): Promise<number> {
    const result = await this.membershipOrderRepo.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ])
    return result[0]?.total || 0
  }

  // Get monthly course sales report (with admin share 10%)
  async getMonthlyCourseSales(): Promise<{ month: number; year: number; total: number }[]> {
    return await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: { $multiply: ['$amount', 0.1] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
        },
      },
    ])
  }

  // Get monthly membership sales report
  async getMonthlyMembershipSales(): Promise<{ month: number; year: number; total: number }[]> {
    return await this.membershipOrderRepo.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$price' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
        },
      },
    ])
  }

  // Get filtered course sales report (daily, weekly, monthly, or custom range)
  async getCourseSalesReportFiltered(
    filter: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom'
      startDate?: Date
      endDate?: Date
    },
    page?: number,
    limit?: number,
  ): Promise<{
    items: IAdminCourseSalesReportItem[]
    totalItems: number
  }> {
    const now = new Date()
    let start: Date
    let end: Date = now

    // Handle different filter types
    switch (filter.type) {
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
      case 'custom':
        if (!filter.startDate || !filter.endDate) {
          throw new Error('Custom filter requires startDate and endDate')
        }
        start = new Date(filter.startDate)
        end = new Date(filter.endDate)
        end.setHours(23, 59, 59, 999)
        break
      default:
        throw new Error('Invalid filter type')
    }

    // Aggregation pipeline to fetch filtered course sales data
    const aggregation: PipelineStage[] = [
      {
        $match: {
          status: 'SUCCESS',
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      { $unwind: '$courseDetails' },
      {
        $lookup: {
          from: 'instructors',
          localField: 'courseDetails.instructorId',
          foreignField: '_id',
          as: 'instructor',
        },
      },
      { $unwind: '$instructor' },
      {
        $group: {
          _id: '$_id',
          orderId: { $first: '$_id' },
          date: { $first: '$createdAt' },
          courses: {
            $push: {
              courseName: '$courseDetails.courseName',
              instructorName: '$instructor.username',
              coursePrice: '$courseDetails.price',
              adminShare: { $multiply: ['$courseDetails.price', 0.1] },
            },
          },
          totalPrice: { $sum: '$courseDetails.price' },
          totalAdminShare: { $sum: { $multiply: ['$courseDetails.price', 0.1] } },
        },
      },
      {
        $project: {
          _id: 0,
          orderId: 1,
          date: 1,
          courses: 1,
          totalPrice: 1,
          totalAdminShare: 1,
        },
      },
    ]

    // Get total item count for pagination
    const totalItems = await this.orderRepo
      .aggregate([
        { $match: { status: 'SUCCESS', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .then((result) => result[0]?.count || 0)

    // Apply pagination if provided
    if (page && limit) {
      aggregation.push({ $skip: (page - 1) * limit })
      aggregation.push({ $limit: limit })
    }

    const items = await this.orderRepo.aggregate<IAdminCourseSalesReportItem>(aggregation)
    return { items, totalItems }
  }

  // Get filtered membership sales report (daily, weekly, monthly, or custom range)
  async getMembershipSalesReportFiltered(
    filter: {
      type: 'daily' | 'weekly' | 'monthly' | 'custom'
      startDate?: Date
      endDate?: Date
    },
    page?: number,
    limit?: number,
  ): Promise<{
    items: IAdminMembershipReportItem[]
    totalItems: number
  }> {
    const now = new Date()
    let start: Date
    let end: Date = now

    // Handle filter types
    switch (filter.type) {
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
      case 'custom':
        if (!filter.startDate || !filter.endDate) {
          throw new Error('Custom filter requires startDate and endDate')
        }
        start = new Date(filter.startDate)
        end = new Date(filter.endDate)
        end.setHours(23, 59, 59, 999)
        break
      default:
        throw new Error('Invalid filter type')
    }

    // Aggregation pipeline to fetch filtered membership sales
    const aggregation: PipelineStage[] = [
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: 'instructors',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructorDetails',
        },
      },
      { $unwind: '$instructorDetails' },
      {
        $lookup: {
          from: 'membershipplans',
          localField: 'membershipPlanId',
          foreignField: '_id',
          as: 'planDetails',
        },
      },
      { $unwind: '$planDetails' },
      {
        $project: {
          _id: 0,
          orderId: '$_id',
          date: '$createdAt',
          instructorName: '$instructorDetails.username',
          planName: '$planDetails.name',
          price: '$price',
        },
      },
    ]

    // Get total items for pagination
    const totalItems = await this.membershipOrderRepo
      .aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .then((result) => result[0]?.count || 0)

    // Apply pagination
    if (page && limit) {
      aggregation.push({ $skip: (page - 1) * limit })
      aggregation.push({ $limit: limit })
    }

    const items = await this.membershipOrderRepo.aggregate<IAdminMembershipReportItem>(aggregation)
    return { items, totalItems }
  }

  // Get top-selling courses (default limit = 3)
  async getTopSellingCourses(limit = 3): Promise<{ courseName: string; salesCount: number }[]> {
    return await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      { $unwind: '$courseDetails' },
      {
        $group: {
          _id: '$courseDetails._id',
          courseName: { $first: '$courseDetails.courseName' },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { salesCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          courseName: 1,
          salesCount: 1,
        },
      },
    ])
  }

  // Get top-selling categories (default limit = 3)
  async getTopSellingCategories(limit = 3): Promise<{ categoryName: string }[]> {
    return await this.orderRepo.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'courseDetails',
        },
      },
      { $unwind: '$courseDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'courseDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$courseDetails.category',
          categoryName: { $first: '$categoryDetails.categoryName' },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { salesCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          categoryName: 1,
        },
      },
    ])
  }
}
