import { Types } from 'mongoose'
import { IInstructorCourseSpecificDashboardRepository } from './interfaces/IInstructorSpecificCourseDashboardRepository'
import { IPaymentRepository } from '../studentRepository/interfaces/IPaymentRepository'
import { IEnrollmentRepository } from '../studentRepository/interfaces/IEnrollmentRepository'
import { ICourseRepository } from '../studentRepository/interfaces/ICourseRepository'
import { IOrderRepository } from '../studentRepository/interfaces/IOrderRepository'
import { INSTRUCTOR_REVENUE_SHARE } from '../../types/constants'

// Repository implementation for Instructor's specific course dashboard
export class InstructorSpecificCourseDashboardRepository
  implements IInstructorCourseSpecificDashboardRepository
{
  constructor(
    private paymentRepo: IPaymentRepository, // Handles payment-related queries
    private enrollmentRepo: IEnrollmentRepository, // Handles enrollment-related queries
    private courseRepo: ICourseRepository, // Handles course-related queries
    private orderRepo: IOrderRepository, // Handles order-related queries
  ) {}

  // Get total revenue for a specific course
  async getCourseRevenue(courseId: Types.ObjectId): Promise<number> {
    const payments = await this.paymentRepo.findAll({ status: 'SUCCESS' })
    let totalRevenue = 0

    for (const payment of payments || []) {
      const order = await this.orderRepo.findById((payment.orderId as Types.ObjectId).toString())
      // Skip if order does not contain the course
      if (!order || !order.courses.includes(courseId)) continue

      const course = await this.courseRepo.findById(courseId.toString())
      if (!course) continue

      // Add instructor's share of revenue
      totalRevenue += course.price * INSTRUCTOR_REVENUE_SHARE
    }

    return totalRevenue
  }

  // Get total number of enrollments for a course
  async getCourseEnrollmentCount(courseId: Types.ObjectId): Promise<number> {
    const enrollments = await this.enrollmentRepo.findAll({ courseId })
    return enrollments?.length || 0
  }

  // Get the category name of a course
  async getCourseCategory(courseId: Types.ObjectId): Promise<string | null> {
    const course = await this.courseRepo.findByIdWithPopulate(courseId.toString(), {
      path: 'category',
      select: 'categoryName',
    })

    // Return category name if available, otherwise null
    return course?.category && 'categoryName' in course.category
      ? (course.category as { categoryName: string }).categoryName
      : null
  }

  // Get monthly sales performance for a specific course
  async getMonthlyPerformance(
    courseId: Types.ObjectId,
  ): Promise<{ month: number; year: number; totalSales: number }[]> {
    const payments = await this.paymentRepo.findAll({ status: 'SUCCESS' })
    const monthlyMap = new Map<string, number>()

    for (const payment of payments || []) {
      const order = await this.orderRepo.findById((payment.orderId as Types.ObjectId).toString())
      if (!order || !order.courses.includes(courseId)) continue

      const course = await this.courseRepo.findById(courseId.toString())
      if (!course) continue

      // Group revenue by year and month
      const date = payment.createdAt
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + course.price * INSTRUCTOR_REVENUE_SHARE)
    }

    // Convert map to array of objects with month, year, and total sales
    return Array.from(monthlyMap.entries()).map(([key, totalSales]) => {
      const [year, month] = key.split('-').map(Number)
      return { month, year, totalSales }
    })
  }

  // Get the price of a course
  async getCoursePrice(courseId: Types.ObjectId): Promise<number> {
    const course = await this.courseRepo.findById(courseId.toString())
    return course?.price || 0
  }

  // Get a detailed revenue report for a course within a given date range
  async getCourseRevenueReport(
    courseId: Types.ObjectId,
    range: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    data: {
      orderId: string
      courseName: string
      purchaseDate: Date
      coursePrice: number
      instructorRevenue: number
      totalEnrollments: number
    }[]
    total: number
  }> {
    const now = new Date()
    let start: Date
    let end: Date

    // Define date range based on requested filter
    switch (range) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        break
      case 'weekly':
        start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Start and end date are required for custom range')
        }
        if (startDate > endDate) {
          throw new Error('Start date must be before end date')
        }
        start = new Date(startDate)
        end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        break
      default:
        throw new Error('Invalid range')
    }

    // Pipeline to count total matching payments
    const totalPipeline = [
      { $match: { status: 'SUCCESS', createdAt: { $gte: start, $lte: end } } },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      { $match: { 'order.courses': courseId } },
      { $count: 'total' },
    ]

    const totalResult = await this.paymentRepo.aggregate(totalPipeline)
    const total = totalResult[0]?.total || 0

    // Get paginated list of payments within date range
    const { data: payments } = await this.paymentRepo.paginate(
      {
        status: 'SUCCESS',
        createdAt: { $gte: start, $lte: end },
      },
      page,
      limit,
      { createdAt: -1 },
    )

    const enrollments = await this.getCourseEnrollmentCount(courseId)

    const results = []

    for (const payment of payments || []) {
      const order = await this.orderRepo.findById((payment.orderId as Types.ObjectId).toString())
      if (!order || !order.courses.includes(courseId)) continue

      const course = await this.courseRepo.findById(courseId.toString())
      if (!course) continue

      // Push detailed revenue record
      results.push({
        orderId: order._id.toString(),
        courseName: course.courseName,
        purchaseDate: payment.createdAt,
        coursePrice: course.price,
        instructorRevenue: course.price * INSTRUCTOR_REVENUE_SHARE,
        totalEnrollments: enrollments,
      })
    }

    console.log('specific dashboard report', results)

    return {
      data: results,
      total,
    }
  }
}
