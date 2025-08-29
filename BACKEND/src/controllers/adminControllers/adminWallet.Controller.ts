import { Response } from 'express'
import { Types } from 'mongoose'
import { IWalletService } from '../../services/genericService/interfaces/IWalletService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { IAdminWalletController } from './interfaces/IAdminWalletController'

// Controller class to manage Admin Wallet related operations
export class AdminWalletController implements IAdminWalletController {
  // Injecting WalletService dependency via constructor
  constructor(private walletService: IWalletService) {}

  // Fetch the wallet details of the authenticated admin
  async getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Convert user ID from request into a MongoDB ObjectId
      const ownerId = new Types.ObjectId(req.user?.id)

      // Fetch wallet details from the service
      const wallet = await this.walletService.getWallet(ownerId)

      // Respond with wallet details
      res.status(StatusCode.OK).json({ success: true, wallet })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch wallet',
      })
    }
  }

  // Add (credit) money into the admin wallet
  async creditWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id)
      const { amount, description, txnId } = req.body

      // Call service method to credit wallet
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

  // Deduct (debit) money from the admin wallet
  async debitWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id)
      const { amount, description, txnId } = req.body

      // Call service method to debit wallet
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

  // Get paginated wallet transaction history
  async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = new Types.ObjectId(req.user?.id)

      // Pagination values (default page=1, limit=5 if not provided)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 5

      // Fetch transactions and total count from service
      const { transactions, total } = await this.walletService.getPaginatedTransactions(
        ownerId,
        page,
        limit,
      )

      // Calculate total number of pages
      const totalPages = Math.ceil(total / limit)

      // Send paginated response
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          transactions,
          currentPage: page,
          totalPages,
          total,
        },
      })
    } catch (error) {
      console.error('Failed to fetch admin wallet transactions:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch transactions',
      })
    }
  }
}
