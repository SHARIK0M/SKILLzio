import { IOrder, OrderModel } from "../../models/order.Model";
import { GenericRepository } from "./generic.Repository"; 

export class OrderRepository extends GenericRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }
}
