import { Response } from 'express'
import { Types } from 'mongoose'
import { IWalletService } from '../../services/genericService/interfaces/IWalletService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IInstructorWalletController } from './interfaces/IInstructorWalletController'

// Controller for handling Instructor Wallet operations
export class InstructorWalletController implements IInstructorWalletController {
  private walletService: IWalletService

  constructor(walletService: IWalletService) {
    this.walletService = walletService
  }

  // Fetch the wallet details of the instructor
  async getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id) // Extract instructor ID from request
      const wallet = await this.walletService.getWallet(ownerId) // Get wallet from service
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch wallet',
      })
    }
  }

  // Credit (add money) to instructor's wallet
  async creditWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id) // Instructor ID
      const { amount, description, txnId } = req.body // Payment details
      const wallet = await this.walletService.creditWallet(ownerId, amount, description, txnId)
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to credit wallet',
      })
    }
  }

  // Debit (deduct money) from instructor's wallet
  async debitWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id) // Instructor ID
      const { amount, description, txnId } = req.body // Debit details
      const wallet = await this.walletService.debitWallet(ownerId, amount, description, txnId)

      // Handle insufficient balance or missing wallet
      if (!wallet) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Insufficient balance or wallet not found',
        })
        return
      }

      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to debit wallet',
      })
    }
  }

  // Get paginated transaction history of instructor wallet
  async getPaginatedTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id) // Instructor ID
      const page = parseInt(req.query.page as string) || 1 // Current page
      const limit = parseInt(req.query.limit as string) || 10 // Number of records per page

      // Fetch transactions and total count from service
      const { transactions, total } = await this.walletService.getPaginatedTransactions(
        ownerId,
        page,
        limit,
      )

      // Return paginated transaction response
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          transactions,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch transaction history',
      })
    }
  }
}
