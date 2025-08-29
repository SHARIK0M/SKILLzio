import { InstructorMembershipOrderDTO } from "../../../models/instructorMembershipOrder.Model"; 

export interface IAdminMembershipOrderService {
  getAllOrders(page: number, limit: number): Promise<{ data: InstructorMembershipOrderDTO[]; total: number }>;
  getOrderDetail(txnId: string): Promise<InstructorMembershipOrderDTO>;
}
