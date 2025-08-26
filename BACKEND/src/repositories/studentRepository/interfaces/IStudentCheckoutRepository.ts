import { Types } from "mongoose";
import { IOrder } from "../../../models/order.Model"; 
import { IPayment } from "../../../models/payment.Model"; 
import { IEnrollment } from "../../../models/enrollment.Model"; 
import { ICourseRepository } from "./ICourseRepository";
export interface IStudentCheckoutRepository {
  createOrder(
    userId: Types.ObjectId,
    courseIds: Types.ObjectId[],
    amount: number,
    razorpayOrderId: string
  ): Promise<IOrder>;

  updateOrderStatus(
    orderId: Types.ObjectId,
    status: "SUCCESS" | "FAILED"
  ): Promise<IOrder | null>;

  savePayment(data: Partial<IPayment>): Promise<IPayment>;

  createEnrollments(
    userId: Types.ObjectId,
    courseIds: Types.ObjectId[]
  ): Promise<IEnrollment[]>;

  getCourseNamesByIds(courseIds: Types.ObjectId[]): Promise<string[]>;

  getEnrolledCourseIds(userId: Types.ObjectId): Promise<Types.ObjectId[]>;

  getCourseRepo(): ICourseRepository;
}
