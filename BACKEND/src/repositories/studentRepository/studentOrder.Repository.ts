import { Types } from 'mongoose'
import { IOrder, OrderModel } from '../../models/order.Model'
import { IStudentOrderRepository } from './interfaces/IStudentOrderRepository'
import { GenericRepository } from '../genericRepo/generic.Repository'

// Repository class to handle student-specific order operations
export class StudentOrderRepository
  extends GenericRepository<IOrder>
  // Inherits generic repository methods
  implements IStudentOrderRepository
{
  // Ensures contract for student order repository
  constructor() {
    // Initialize repository with the Order model
    super(OrderModel)
  }

  /**
   * Fetch paginated list of user orders with status "SUCCESS"
   * @param userId - The ObjectId of the user whose orders are being fetched
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns An object containing paginated orders and total count
   */
  async getUserOrdersPaginated(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ orders: IOrder[]; total: number }> {
    const { data, total } = await this.paginate(
      { userId, status: 'SUCCESS' }, // Filter orders by user and success status
      page, // Page number for pagination
      limit, // Limit per page
      { createdAt: -1 }, // Sort orders by newest first
      ['courses'], // Populate courses field
    )

    return { orders: data, total } // Rename data to orders for clarity
  }

  /**
   * Fetch a single order by ID that belongs to a specific user
   * Only returns if the order status is "SUCCESS"
   * @param orderId - The ObjectId of the order
   * @param userId - The ObjectId of the user (ensures ownership)
   * @returns Order document or null if not found
   */
  async getOrderById(orderId: Types.ObjectId, userId: Types.ObjectId): Promise<IOrder | null> {
    return await this.findOne(
      { _id: orderId, userId, status: 'SUCCESS' }, // Ensure order matches user and is successful
      ['courses', 'userId'], // Populate courses and userId fields
    )
  }
}
