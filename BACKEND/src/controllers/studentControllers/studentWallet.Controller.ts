import { Response } from 'express'
import { Types } from 'mongoose'
import { IWalletService } from '../../services/genericService/interfaces/IWalletService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IStudentWalletController } from './interfaces/IStudentWalletController'

export class StudentWalletController implements IStudentWalletController {
  private walletService: IWalletService

  // Constructor receives a wallet service instance through dependency injection
  constructor(walletService: IWalletService) {
    this.walletService = walletService
  }

  // Controller method to fetch a student's wallet details
  async getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract user ID from request and convert to ObjectId
      const ownerId = new Types.ObjectId(req.user?.id)

      // Call service to get wallet details
      const wallet = await this.walletService.getWallet(ownerId)

      console.log(wallet)

      // Send wallet details in response
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)

      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch wallet',
      })
    }
  }

  // Controller method to add (credit) balance to student's wallet
  async creditWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract user ID
      const ownerId = new Types.ObjectId(req.user?.id)

      // Extract transaction details from request body
      const { amount, description, txnId } = req.body

      // Call service to credit wallet
      const wallet = await this.walletService.creditWallet(ownerId, amount, description, txnId)

      // Respond with updated wallet
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)

      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to credit wallet',
      })
    }
  }

  // Controller method to deduct (debit) balance from student's wallet
  async debitWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract user ID
      const ownerId = new Types.ObjectId(req.user?.id)

      // Extract transaction details from request body
      const { amount, description, txnId } = req.body

      // Call service to debit wallet
      const wallet = await this.walletService.debitWallet(ownerId, amount, description, txnId)

      // If wallet not found or insufficient balance
      if (!wallet) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Insufficient balance or wallet not found',
        })
        return
      }

      // Respond with updated wallet
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)

      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to debit wallet',
      })
    }
  }

  // Controller method to fetch paginated wallet transactions
  async getPaginatedTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract user ID
      const ownerId = new Types.ObjectId(req.user?.id)

      // Get pagination params from query (default: page=1, limit=5)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 5

      // Call service to fetch transactions with pagination
      const { transactions, total } = await this.walletService.getPaginatedTransactions(
        ownerId,
        page,
        limit,
      )

      // Respond with paginated transaction details
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          transactions,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error(error)

      // Handle unexpected errors
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch transactions',
      })
    }
  }
}
