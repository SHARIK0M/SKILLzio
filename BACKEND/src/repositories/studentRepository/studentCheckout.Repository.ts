import { IStudentCheckoutRepository } from './interfaces/IStudentCheckoutRepository'
import { IOrderRepository } from './interfaces/IOrderRepository'
import { IPaymentRepository } from './interfaces/IPaymentRepository'
import { IEnrollmentRepository } from './interfaces/IEnrollmentRepository'
import { ICourseRepository } from './interfaces/ICourseRepository'

import { Types } from 'mongoose'
import { IOrder } from '../../models/order.Model'
import { IPayment } from '../../models/payment.Model'
import { IEnrollment } from '../../models/enrollment.Model'

// Repository class that handles checkout-related operations for a student
export class StudentCheckoutRepository implements IStudentCheckoutRepository {
  constructor(
    private readonly orderRepo: IOrderRepository, // For handling order-related operations
    private readonly paymentRepo: IPaymentRepository, // For handling payment-related operations
    private readonly enrollmentRepo: IEnrollmentRepository, // For handling course enrollment operations
    private readonly courseRepo: ICourseRepository, // For fetching course details
  ) {}

  // Create a new order for a student
  async createOrder(
    userId: Types.ObjectId,
    courseIds: Types.ObjectId[],
    amount: number,
    razorpayOrderId: string,
  ): Promise<IOrder> {
    return this.orderRepo.create({
      userId,
      courses: courseIds,
      amount,
      status: 'PENDING', // Default order status
      gateway: 'razorpay', // Payment gateway
      gatewayOrderId: razorpayOrderId,
    } as Partial<IOrder>)
  }

  // Update the status of an existing order (SUCCESS or FAILED)
  async updateOrderStatus(
    orderId: Types.ObjectId,
    status: 'SUCCESS' | 'FAILED',
  ): Promise<IOrder | null> {
    return this.orderRepo.update(orderId.toString(), { status })
  }

  // Save a payment record in the database
  async savePayment(data: Partial<IPayment>): Promise<IPayment> {
    return this.paymentRepo.create(data)
  }

  // Create enrollments for a student for multiple courses
  async createEnrollments(
    userId: Types.ObjectId,
    courseIds: Types.ObjectId[],
  ): Promise<IEnrollment[]> {
    const enrollments = courseIds.map((courseId) => ({
      userId,
      courseId,
      completionStatus: 'NOT_STARTED', // Default status for new enrollment
      certificateGenerated: false, // Initially no certificate
      enrolledAt: new Date(), // Timestamp of enrollment
    }))
    return this.enrollmentRepo.create(enrollments as Partial<IEnrollment>[])
  }

  // Fetch course names for given course IDs
  async getCourseNamesByIds(courseIds: Types.ObjectId[]): Promise<string[]> {
    const courses = await this.courseRepo.findAll({ _id: { $in: courseIds } })
    return (courses || []).map((c) => c.courseName)
  }

  // Get all course IDs in which a student is already enrolled
  async getEnrolledCourseIds(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const enrollments = (await this.enrollmentRepo.findAll({ userId })) || []
    return enrollments.map((e) => e.courseId)
  }

  // Expose courseRepo if direct access is needed
  getCourseRepo(): ICourseRepository {
    return this.courseRepo
  }
}
