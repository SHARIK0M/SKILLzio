import { IWalletService } from './interfaces/IWalletService'
import { IWalletRepository } from '../../repositories/genericRepo/interfaces/IWalletRepository'
import { IAdminRepository } from '../../repositories/adminRepository/interfaces/IAdminRepository'
import { IWallet } from '../../models/wallet.Model'
import { Types } from 'mongoose'

export class WalletService implements IWalletService {
  constructor(
    private readonly walletRepository: IWalletRepository, // repository for wallet operations
    private readonly adminRepository: IAdminRepository, // repository for admin-related data
  ) {}

  // Get wallet by ownerId (user/instructor/admin)
  async getWallet(ownerId: Types.ObjectId): Promise<IWallet | null> {
    return this.walletRepository.findByOwnerId(ownerId)
  }

  // Credit money into a wallet
  async creditWallet(
    ownerId: Types.ObjectId,
    amount: number,
    description: string,
    txnId: string,
  ): Promise<IWallet | null> {
    return this.walletRepository.creditWallet(ownerId, amount, description, txnId)
  }

  // Debit money from a wallet (accepts both string and ObjectId for ownerId)
  async debitWallet(
    ownerId: string | Types.ObjectId,
    amount: number,
    description: string,
    txnId: string,
  ): Promise<IWallet | null> {
    // Convert ownerId to ObjectId if it is in string format
    const objectId = typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId

    return this.walletRepository.debitWallet(objectId, amount, description, txnId)
  }

  // Initialize a new wallet for a user, instructor, or admin
  async initializeWallet(
    ownerId: Types.ObjectId,
    onModel: 'User' | 'Instructor' | 'Admin', // which model owns this wallet
    role: 'student' | 'instructor' | 'admin', // role of the wallet owner
  ): Promise<IWallet> {
    return this.walletRepository.createWallet(ownerId, onModel, role)
  }

  // Credit money to admin’s wallet using email
  async creditAdminWalletByEmail(
    email: string,
    amount: number,
    description: string,
    txnId: string,
  ): Promise<void> {
    // Fetch admin details using email
    const admin = await this.adminRepository.getAdmin(email)

    console.log('admin info', admin)

    if (!admin) throw new Error('Admin not found')

    const adminId = admin._id
    console.log('admin id', adminId)

    // Check if admin already has a wallet, otherwise create one
    let adminWallet = await this.walletRepository.findByOwnerId(adminId)
    if (!adminWallet) {
      console.warn('No wallet found for admin — creating new one!')
      adminWallet = await this.walletRepository.createWallet(adminId, 'Admin', admin.role)
    }

    // Credit money into admin’s wallet
    await this.walletRepository.creditWallet(adminId, amount, description, txnId)
  }

  // Get paginated wallet transactions (useful for history or statement)
  async getPaginatedTransactions(ownerId: Types.ObjectId, page: number, limit: number) {
    return this.walletRepository.getPaginatedTransactions(ownerId, page, limit)
  }

  // Get admin wallet details by email
  async getAdminWalletByEmail(email: string): Promise<IWallet | null> {
    const admin = await this.adminRepository.getAdmin(email)
    if (!admin) return null
    return this.walletRepository.findByOwnerId(admin._id)
  }
}
