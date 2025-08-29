import { IAdminMembershipOrderRepository } from './interfaces/IAdminMembershipOrderRepository'
import { InstructorMembershipOrderModel } from '../../models/instructorMembershipOrder.Model'
import { InstructorMembershipOrderDTO } from '../../models/instructorMembershipOrder.Model'

// Repository class responsible for fetching instructor membership orders
export class AdminMembershipOrderRepository implements IAdminMembershipOrderRepository {
  // Fetch all membership orders with pagination (only "paid" ones are included)
  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: InstructorMembershipOrderDTO[]; total: number }> {
    // Calculate how many documents to skip based on the current page
    const skip = (page - 1) * limit

    // Execute queries in parallel: fetch paginated orders and count total paid orders
    const [orders, total] = await Promise.all([
      InstructorMembershipOrderModel.find({ paymentStatus: 'paid' }) // Only include paid orders
        .populate('instructorId', 'name email') // Populate instructor info (only name and email)
        .populate('membershipPlanId', 'name durationInDays') // Populate plan info (only name and duration)
        .sort({ createdAt: -1 }) // Sort orders by newest first
        .skip(skip) // Skip documents for pagination
        .limit(limit) // Limit documents per page
        .lean(), // Convert MongoDB docs into plain JS objects for performance
      InstructorMembershipOrderModel.countDocuments({ paymentStatus: 'paid' }), // Count only paid orders
    ])

    // Transform raw MongoDB documents into DTO format
    const data: InstructorMembershipOrderDTO[] = orders.map((order) => ({
      instructor: {
        name: (order.instructorId as any).name,
        email: (order.instructorId as any).email,
      },
      membershipPlan: {
        name: (order.membershipPlanId as any).name,
        durationInDays: (order.membershipPlanId as any).durationInDays,
      },
      price: order.price,
      paymentStatus: order.paymentStatus,
      startDate: order.startDate,
      endDate: order.endDate,
      txnId: order.txnId,
      createdAt: order.createdAt,
    }))

    // Return paginated data along with total count
    return { data, total }
  }

  // Fetch a specific membership order by transaction ID
  async findByTxnId(txnId: string): Promise<InstructorMembershipOrderDTO | null> {
    // Find the order with the given txnId and populate related data
    const order = await InstructorMembershipOrderModel.findOne({ txnId })
      .populate('instructorId', 'name email')
      .populate('membershipPlanId', 'name durationInDays')
      .lean()

    // If no order is found, return null
    if (!order) return null

    // Return order in DTO format
    return {
      instructor: {
        name: (order.instructorId as any).name,
        email: (order.instructorId as any).email,
      },
      membershipPlan: {
        name: (order.membershipPlanId as any).name,
        durationInDays: (order.membershipPlanId as any).durationInDays,
      },
      price: order.price,
      paymentStatus: order.paymentStatus,
      startDate: order.startDate,
      endDate: order.endDate,
      txnId: order.txnId,
      createdAt: order.createdAt,
    }
  }
}
