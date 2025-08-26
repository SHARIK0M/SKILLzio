import { IWalletRepository } from './interfaces/IWalletRepository'
import WalletModel, { IWallet } from '../../models/wallet.Model'
import { Types } from 'mongoose'
import { GenericRepository } from './generic.Repository'

// WalletRepository handles all wallet-related database operations.
// It extends a GenericRepository to reuse common CRUD methods.
export class WalletRepository extends GenericRepository<IWallet> implements IWalletRepository {
  constructor() {
    // Pass the WalletModel to the generic repository for base CRUD
    super(WalletModel)
  }

  // Find wallet by ownerId (student, instructor, or admin)
  async findByOwnerId(ownerId: Types.ObjectId): Promise<IWallet | null> {
    return await this.findOne({ ownerId })
  }

  // Create a new wallet for a given owner
  async createWallet(ownerId: Types.ObjectId, onModel: string, role: string): Promise<IWallet> {
    const wallet = new WalletModel({ ownerId, onModel, role })
    return wallet.save()
  }

  // Credit (add money) to the wallet and record transaction
  async creditWallet(
    ownerId: Types.ObjectId,
    amount: number,
    description: string,
    txnId: string,
  ): Promise<IWallet | null> {
    return await this.findOneAndUpdate(
      { ownerId },
      {
        $inc: { balance: amount }, // increase balance
        $push: {
          transactions: {
            amount,
            type: 'credit',
            description,
            txnId,
            date: new Date(),
          },
        },
      },
      { new: true }, // return updated wallet
    )
  }

  // Debit (deduct money) from the wallet and record transaction
  async debitWallet(
    ownerId: Types.ObjectId,
    amount: number,
    description: string,
    txnId: string,
  ): Promise<IWallet | null> {
    // First check if wallet exists and has enough balance
    const wallet = await this.findOne({ ownerId })
    if (!wallet || wallet.balance < amount) return null

    // Deduct balance and record transaction
    return await this.findOneAndUpdate(
      { ownerId },
      {
        $inc: { balance: -amount }, // decrease balance
        $push: {
          transactions: {
            amount,
            type: 'debit',
            description,
            txnId,
            date: new Date(),
          },
        },
      },
      { new: true }, // return updated wallet
    )
  }

  // Get paginated transactions for a wallet (with newest first)
  async getPaginatedTransactions(
    ownerId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ transactions: IWallet['transactions']; total: number }> {
    const wallet = await WalletModel.findOne({ ownerId })

    // If no wallet found, return empty
    if (!wallet) return { transactions: [], total: 0 }

    const total = wallet.transactions.length

    // Sort transactions by date (latest first), then paginate
    const transactions = wallet.transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice((page - 1) * limit, page * limit)

    return { transactions, total }
  }
}
