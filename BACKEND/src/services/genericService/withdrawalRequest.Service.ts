import { Types } from 'mongoose'
import { IWithdrawalRequestService } from './interfaces/IWithdrawalRequestService'
import { IWithdrawalRequestRepository } from '../../repositories/genericRepo/interfaces/IWithdrawalRequestRepository'
import { IWalletService } from './interfaces/IWalletService'
import IInstructorRepository from '../../repositories/instructorRepository/interfaces/IInstructorRepository'
import { IWithdrawalRequest } from '../../models/withdrawalRequest.Model'
import { v4 as uuidv4 } from 'uuid'
import { IPaginationOptions } from '../../types/IPagination'

// Service class that handles all withdrawal request operations
export class WithdrawalRequestService implements IWithdrawalRequestService {
  constructor(
    private withdrawalRequestRepo: IWithdrawalRequestRepository, // Repository for withdrawal requests
    private walletService: IWalletService, // Service for managing wallet transactions
    private instructorRepo: IInstructorRepository, // Repository for instructor data
  ) {}

  // Create a new withdrawal request for an instructor
  async createWithdrawalRequest(
    instructorId: Types.ObjectId,
    amount: number,
  ): Promise<IWithdrawalRequest> {
    // Find the instructor by ID
    const instructor = await this.instructorRepo.findById(instructorId.toString())
    if (!instructor) {
      throw new Error('Instructor not found')
    }

    // Check if instructor has valid bank account details
    const bankAccount = instructor.bankAccount
    if (
      !bankAccount ||
      !bankAccount.accountHolderName ||
      !bankAccount.accountNumber ||
      !bankAccount.ifscCode ||
      !bankAccount.bankName
    ) {
      throw new Error('Bank account details are incomplete')
    }

    // Prepare validated bank account object
    const validatedBankAccount: IWithdrawalRequest['bankAccount'] = {
      accountHolderName: bankAccount.accountHolderName,
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifscCode,
      bankName: bankAccount.bankName,
    }

    // Check instructor's wallet balance
    const wallet = await this.walletService.getWallet(instructorId)
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance')
    }

    // Create a withdrawal request in the repository
    return this.withdrawalRequestRepo.createWithdrawalRequest(
      instructorId,
      amount,
      validatedBankAccount,
    )
  }

  // Approve a withdrawal request by an admin
  async approveWithdrawalRequest(
    requestId: Types.ObjectId,
    adminId: Types.ObjectId,
    remarks?: string,
  ): Promise<IWithdrawalRequest> {
    // Find the withdrawal request
    const request = await this.withdrawalRequestRepo.findById(requestId.toString())
    if (!request) {
      throw new Error('Withdrawal request not found')
    }
    // Request must be in "pending" status to approve
    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status')
    }

    // Extract instructorId from request (can be ObjectId or populated object)
    let instructorId: Types.ObjectId
    if (request.instructorId instanceof Types.ObjectId) {
      instructorId = request.instructorId
    } else {
      instructorId = new Types.ObjectId(request.instructorId._id.toString())
    }

    // Debit the requested amount from instructor's wallet
    const wallet = await this.walletService.debitWallet(
      instructorId,
      request.amount,
      `Withdrawal approved by admin: ${remarks || 'No remarks'}`,
      uuidv4(), // Generate unique transaction ID
    )
    if (!wallet) {
      throw new Error('Failed to debit wallet')
    }

    // Update the request status to "approved"
    const updatedRequest = await this.withdrawalRequestRepo.updateStatus(
      requestId,
      'approved',
      adminId,
      remarks,
    )
    if (!updatedRequest) {
      throw new Error('Failed to update withdrawal request status')
    }

    return updatedRequest
  }

  // Reject a withdrawal request by an admin
  async rejectWithdrawalRequest(
    requestId: Types.ObjectId,
    adminId: Types.ObjectId,
    remarks?: string,
  ): Promise<IWithdrawalRequest> {
    // Find the withdrawal request
    const request = await this.withdrawalRequestRepo.findById(requestId.toString())
    if (!request) {
      throw new Error('Withdrawal request not found')
    }
    // Request must be in "pending" status to reject
    if (request.status !== 'pending') {
      throw new Error('Request is not in pending status')
    }

    // Update the request status to "rejected"
    const updatedRequest = await this.withdrawalRequestRepo.updateStatus(
      requestId,
      'rejected',
      adminId,
      remarks,
    )
    if (!updatedRequest) {
      throw new Error('Failed to update withdrawal request status')
    }

    return updatedRequest
  }

  // Retry a rejected withdrawal request (with optional new amount)
  async retryWithdrawalRequest(
    requestId: Types.ObjectId,
    amount?: number,
  ): Promise<IWithdrawalRequest> {
    // Find the withdrawal request
    const request = await this.withdrawalRequestRepo.findById(requestId.toString())
    if (!request) {
      throw new Error('Withdrawal request not found')
    }

    // Only rejected requests can be retried
    if (request.status !== 'rejected') {
      throw new Error('Only rejected requests can be retried')
    }

    // Extract instructorId from request (can be ObjectId or populated object)
    let instructorId: Types.ObjectId
    if (request.instructorId instanceof Types.ObjectId) {
      instructorId = request.instructorId
    } else {
      instructorId = new Types.ObjectId(request.instructorId._id.toString())
    }

    // If new amount is provided, validate wallet balance
    if (amount !== undefined) {
      const wallet = await this.walletService.getWallet(instructorId)
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance for the new amount')
      }
    }

    // Retry the withdrawal request in the repository
    const updatedRequest = await this.withdrawalRequestRepo.retryRequest(requestId, amount)
    if (!updatedRequest) {
      throw new Error('Failed to retry withdrawal request')
    }

    return updatedRequest
  }

  // Get all withdrawal requests of a specific instructor with pagination
  async getInstructorRequestsWithPagination(
    instructorId: Types.ObjectId,
    options: IPaginationOptions,
  ): Promise<{ transactions: IWithdrawalRequest[]; total: number }> {
    return this.withdrawalRequestRepo.findByInstructorIdWithPagination(instructorId, options)
  }

  // Get all withdrawal requests (admin use) with pagination
  async getAllRequestsWithPagination(
    options: IPaginationOptions,
  ): Promise<{ transactions: IWithdrawalRequest[]; total: number }> {
    return this.withdrawalRequestRepo.getAllRequestsWithPagination(options)
  }

  // Get a single withdrawal request by its ID
  async getWithdrawalRequestById(requestId: Types.ObjectId): Promise<IWithdrawalRequest> {
    const request = await this.withdrawalRequestRepo.findById(requestId.toString())
    if (!request) {
      throw new Error('Withdrawal request not found')
    }
    return request
  }
}
