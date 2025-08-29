import {
  InstructorMembershipOrderModel,
  IInstructorMembershipOrder,
} from '../../models/instructorMembershipOrder.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { IInstructorMembershipOrderRepository } from './interfaces/IInstructorMembershipOrderRepository'
import { Types } from 'mongoose'

// Repository class to manage instructor membership orders
export class InstructorMembershipOrderRepository
  extends GenericRepository<IInstructorMembershipOrder>
  implements IInstructorMembershipOrderRepository
{
  constructor() {
    // Pass the InstructorMembershipOrder model to the generic repository
    super(InstructorMembershipOrderModel)
  }

  // Create a new membership order for an instructor
  async createOrder(data: {
    instructorId: string
    planId: string
    razorpayOrderId: string
    amount: number
    status: 'pending' | 'paid'
    startDate?: Date
    endDate?: Date
  }) {
    return await this.create({
      instructorId: new Types.ObjectId(data.instructorId), // convert string to ObjectId
      membershipPlanId: new Types.ObjectId(data.planId), // link to membership plan
      price: data.amount, // store order amount
      txnId: data.razorpayOrderId, // Razorpay transaction/order id
      paymentStatus: data.status, // order status (pending/paid)
      startDate: data.startDate || new Date(), // default: current date
      endDate: data.endDate || new Date(), // default: current date
    })
  }

  // Find an order using Razorpay order/transaction id
  async findByRazorpayOrderId(orderId: string) {
    return await this.findOne({ txnId: orderId })
  }

  // Update membership order status by transaction id
  async updateOrderStatus(orderId: string, data: Partial<IInstructorMembershipOrder>) {
    await this.updateOne({ txnId: orderId }, data)
  }

  // Find all paid membership orders for a specific instructor with pagination
  async findAllByInstructorId(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: IInstructorMembershipOrder[]; total: number }> {
    const filter = {
      instructorId: new Types.ObjectId(instructorId), // filter by instructor
      paymentStatus: 'paid', // only paid orders
    }

    // Paginate results, sort by creation date (latest first), and populate membershipPlanId
    return await this.paginate(filter, page, limit, { createdAt: -1 }, ['membershipPlanId'])
  }

  // Find a single order by transaction id and populate plan + instructor details
  async findOneByTxnId(txnId: string): Promise<IInstructorMembershipOrder | null> {
    return await this.findOne({ txnId }, ['membershipPlanId', 'instructorId'])
  }
}
