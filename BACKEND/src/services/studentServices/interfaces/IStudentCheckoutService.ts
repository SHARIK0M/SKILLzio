import { Types } from "mongoose";
import { IOrder } from "../../../models/order.Model"; 
import { IPayment } from "../../../models/payment.Model";
import { IEnrollment } from "../../../models/enrollment.Model";

export interface IStudentCheckoutService {
  initiateCheckout(
    userId: Types.ObjectId,
    courseIds: Types.ObjectId[],
    totalAmount: number,
    paymentMethod : 'wallet' | 'razorpay',
  ): Promise<IOrder>;

  verifyAndCompleteCheckout(
    orderId: Types.ObjectId,
    paymentId: string,
    method: string,
    amount: number
  ): Promise<{
    order: IOrder;
    payment: IPayment;
    enrollments: IEnrollment[];
  }>;
}
