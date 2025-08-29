import { Response } from 'express'
import { Types } from 'mongoose'
import { IWithdrawalRequestService } from '../../services/genericService/interfaces/IWithdrawalRequestService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IInstructorWithdrawalController } from './interfaces/IInstructorWithdrawalController'

// Controller class to handle Instructor Withdrawal operations
export class InstructorWithdrawalController implements IInstructorWithdrawalController {
  // Dependency Injection: service responsible for withdrawal logic
  constructor(private withdrawalRequestService: IWithdrawalRequestService) {}

  // Method to create a new withdrawal request
  async createWithdrawalRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Convert instructor ID from the authenticated user to ObjectId
      const instructorId = new Types.ObjectId(req.user?.id)
      const { amount } = req.body // Withdrawal amount sent from client

      // Call service to create a withdrawal request
      const request = await this.withdrawalRequestService.createWithdrawalRequest(
        instructorId,
        amount,
      )

      // Respond with success if created
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Withdrawal request created successfully',
        data: request,
      })
    } catch (error: any) {
      // Handle errors gracefully
      console.error(error)
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to create withdrawal request',
      })
    }
  }

  // Method to fetch instructor withdrawal requests with pagination
  async getWithdrawalRequestsWithPagination(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const instructorId = new Types.ObjectId(req.user?.id)

      // Extract pagination query params, default page=1, limit=10
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      // Validation: page must be > 0
      if (page < 1) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Page number must be greater than 0',
        })
        return
      }

      // Validation: limit must be between 1 and 100
      if (limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Limit must be between 1 and 100',
        })
        return
      }

      // Fetch paginated withdrawal requests using service
      const { transactions, total } =
        await this.withdrawalRequestService.getInstructorRequestsWithPagination(instructorId, {
          page,
          limit,
        })

      // Send paginated response
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          transactions, // list of withdrawal requests
          currentPage: page, // current page number
          totalPages: Math.ceil(total / limit), // total pages
          total, // total count of records
        },
      })
    } catch (error: any) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch withdrawal requests',
      })
    }
  }

  // Method to retry a failed/rejected withdrawal request
  async retryWithdrawalRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get request ID from route params
      const requestId = new Types.ObjectId(req.params.requestId)
      const { amount } = req.body // Optional: updated amount

      // Call service to retry withdrawal
      const request = await this.withdrawalRequestService.retryWithdrawalRequest(requestId, amount)

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Withdrawal request retried successfully',
        data: request,
      })
    } catch (error: any) {
      console.error(error)

      // Decide status code based on error type
      const statusCode = error.message.includes('not found')
        ? StatusCode.NOT_FOUND
        : error.message.includes('Only rejected')
          ? StatusCode.BAD_REQUEST
          : StatusCode.INTERNAL_SERVER_ERROR

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retry withdrawal request',
      })
    }
  }
}
