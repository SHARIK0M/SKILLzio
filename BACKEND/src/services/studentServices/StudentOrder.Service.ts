import { Types } from "mongoose";
import { IStudentOrderService } from "./interfaces/IStudentOrderService"; 
import { IStudentOrderRepository } from "../../repositories/studentRepository/interfaces/IStudentOrderRepository"; 
import { IOrder } from "../../models/order.Model";

export class StudentOrderService implements IStudentOrderService {
  constructor(private orderRepo: IStudentOrderRepository) {}

  async getOrderHistoryPaginated(userId: Types.ObjectId, page: number, limit: number): Promise<{ orders: IOrder[]; total: number }> {
    return this.orderRepo.getUserOrdersPaginated(userId, page, limit);
  }

  async getOrderDetails(orderId: Types.ObjectId, userId: Types.ObjectId): Promise<IOrder | null> {
    return this.orderRepo.getOrderById(orderId, userId);
  }
}
