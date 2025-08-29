import { Types, SortOrder, PipelineStage } from 'mongoose'
import WithdrawalRequestModel, { IWithdrawalRequest } from '../../models/withdrawalRequest.Model'
import { IWithdrawalRequestRepository } from './interfaces/IWithdrawalRequestRepository'
import { IPaginationOptions } from '../../types/IPagination'
import { GenericRepository } from './generic.Repository'

// Repository class to handle all database operations related to withdrawal requests
export class WithdrawalRequestRepository
  extends GenericRepository<IWithdrawalRequest>
  implements IWithdrawalRequestRepository
{
  constructor() {
    // Pass WithdrawalRequestModel to the generic repository so that
    // all common DB operations (create, update, paginate, etc.) can be reused
    super(WithdrawalRequestModel)
  }

  // Create a new withdrawal request for an instructor
  async createWithdrawalRequest(
    instructorId: Types.ObjectId,
    amount: number,
    bankAccount: IWithdrawalRequest['bankAccount'],
  ): Promise<IWithdrawalRequest> {
    const request = await this.create({
      instructorId,
      amount,
      bankAccount,
      status: 'pending', // default status when request is first created
    })
    return request
  }

  // Find a withdrawal request by its ID and populate instructor details
  async findById(requestId: string): Promise<IWithdrawalRequest | null> {
    return this.findByIdWithPopulate(requestId, {
      path: 'instructorId',
      select: 'username email', // only return selected fields
    })
  }

  // Get withdrawal requests of a specific instructor with pagination
  async findByInstructorIdWithPagination(
    instructorId: Types.ObjectId,
    options: IPaginationOptions,
  ): Promise<{ transactions: IWithdrawalRequest[]; total: number }> {
    const { page, limit } = options
    const filter = { instructorId }
    const sort = { createdAt: -1 as SortOrder } // latest requests first
    const populate = { path: 'instructorId', select: 'username email' }

    const result = await this.paginate(filter, page, limit, sort, populate)
    return { transactions: result.data, total: result.total }
  }

  // Update the status of a withdrawal request (approve or reject)
  async updateStatus(
    requestId: Types.ObjectId,
    status: 'approved' | 'rejected',
    adminId: Types.ObjectId,
    remarks?: string,
  ): Promise<IWithdrawalRequest | null> {
    return this.updateOneWithPopulate(
      { _id: requestId },
      { status, adminId, remarks },
      { path: 'instructorId', select: 'username email' },
    )
  }

  // Retry a failed request by setting it back to "pending"
  // Optionally allow updating the withdrawal amount
  async retryRequest(
    requestId: Types.ObjectId,
    amount?: number,
  ): Promise<IWithdrawalRequest | null> {
    const updateData: any = {
      status: 'pending',
      adminId: undefined, // reset admin since it’s a retry
      remarks: '', // clear previous remarks
      updatedAt: new Date(),
    }

    if (amount !== undefined) {
      updateData.amount = amount // update amount if provided
    }

    return this.updateOneWithPopulate({ _id: requestId }, updateData, {
      path: 'instructorId',
      select: 'username email',
    })
  }

  // Get all withdrawal requests (for admin) with pagination
  async getAllRequestsWithPagination(
    options: IPaginationOptions,
  ): Promise<{ transactions: IWithdrawalRequest[]; total: number }> {
    const { page, limit } = options

    // Aggregation pipeline for advanced filtering and sorting
    const aggregationPipeline: PipelineStage[] = [
      {
        // Assign a numeric order to status so sorting becomes predictable
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'pending'] }, then: 1 },
                { case: { $eq: ['$status', 'rejected'] }, then: 2 },
                { case: { $eq: ['$status', 'completed'] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { statusOrder: 1, createdAt: -1 } }, // sort by status priority and then latest created
      { $skip: (page - 1) * limit }, // skip records for pagination
      { $limit: limit }, // limit results per page
      {
        // Join instructor details from instructors collection
        $lookup: {
          from: 'instructors',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructor',
        },
      },
      {
        // Flatten instructor array to single object
        $unwind: {
          path: '$instructor',
          preserveNullAndEmptyArrays: true, // allow null if no match found
        },
      },
      {
        // Select only required fields to return
        $project: {
          _id: 1,
          instructorId: 1,
          amount: 1,
          bankAccount: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          adminId: 1,
          remarks: 1,
          instructor: {
            _id: '$instructor._id',
            username: '$instructor.username',
            email: '$instructor.email',
          },
        },
      },
    ]

    // Execute aggregation
    const result = await WithdrawalRequestModel.aggregate(aggregationPipeline).exec()
    const total = await WithdrawalRequestModel.countDocuments()

    return { transactions: result || [], total }
  }
}
