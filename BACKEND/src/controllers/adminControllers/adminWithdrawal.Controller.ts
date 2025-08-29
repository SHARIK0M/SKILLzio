import { Response } from 'express'
import { Types } from 'mongoose'
import { IWithdrawalRequestService } from '../../services/genericService/interfaces/IWithdrawalRequestService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IAdminWithdrawalController } from './interfaces/IAdminWithdrawalController'

// Controller for handling Admin Withdrawal Requests
export class AdminWithdrawalController implements IAdminWithdrawalController {
  // Dependency injection of withdrawalRequestService
  constructor(private withdrawalRequestService: IWithdrawalRequestService) {}

  // Get all withdrawal requests with pagination
  async getAllWithdrawalRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get pagination values from query params
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10

      // Validate page number
      if (page < 1) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Page number must be greater than 0',
        })
        return
      }

      // Validate limit (between 1 and 100 only)
      if (limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Limit must be between 1 and 100',
        })
        return
      }

      // Fetch withdrawal requests with pagination
      const { transactions, total } =
        await this.withdrawalRequestService.getAllRequestsWithPagination({ page, limit })

      // Send success response
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          transactions, // List of withdrawal requests
          currentPage: page, // Current page number
          totalPages: Math.ceil(total / limit), // Total pages based on total records
          total, // Total number of requests
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

  // Approve a withdrawal request
  async approveWithdrawalRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const adminId = new Types.ObjectId(req.user?.id) // Admin ID from logged-in user
      const { requestId, remarks } = req.body // Request ID and remarks from body

      // Call service to approve request
      const request = await this.withdrawalRequestService.approveWithdrawalRequest(
        new Types.ObjectId(requestId),
        adminId,
        remarks,
      )

      // Send success response
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Withdrawal request approved successfully',
        data: request,
      })
    } catch (error: any) {
      console.error(error)
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to approve withdrawal request',
      })
    }
  }

  // Reject a withdrawal request
  async rejectWithdrawalRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const adminId = new Types.ObjectId(req.user?.id) // Admin ID from logged-in user
      const { requestId, remarks } = req.body // Request ID and remarks from body

      // Call service to reject request
      const request = await this.withdrawalRequestService.rejectWithdrawalRequest(
        new Types.ObjectId(requestId),
        adminId,
        remarks,
      )

      // Send success response
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Withdrawal request rejected successfully',
        data: request,
      })
    } catch (error: any) {
      console.error(error)
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to reject withdrawal request',
      })
    }
  }

  // Get withdrawal request details by ID
  async getWithdrawalRequestById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.params

      // Validate requestId format
      if (!Types.ObjectId.isValid(requestId)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Invalid request ID format',
        })
        return
      }

      // Fetch request details by ID
      const request = await this.withdrawalRequestService.getWithdrawalRequestById(
        new Types.ObjectId(requestId),
      )

      // Send success response
      res.status(StatusCode.OK).json({
        success: true,
        data: request,
      })
    } catch (error: any) {
      console.error('Error fetching withdrawal request by ID:', error)

      // Handle not found case
      if (error.message === 'Withdrawal request not found') {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: error.message,
        })
        return
      }

      // Handle other errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch withdrawal request',
      })
    }
  }
}
