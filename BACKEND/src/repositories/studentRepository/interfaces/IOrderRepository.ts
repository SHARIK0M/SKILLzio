import { IGenericRepository } from "../../genericRepo/generic.Repository"; 
import { IOrder } from "../../../models/order.Model"; 

export interface IOrderRepository extends IGenericRepository<IOrder> {
  // Add specific methods here if needed
}
