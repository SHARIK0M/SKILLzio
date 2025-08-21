import { IAdminRepository } from './interfaces/IAdminRepository'
import AdminModel, { IAdmin } from '../../models/admin.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { IUser } from '../../models/user.Model'
import { IInstructor } from '../../models/instructor.Model'
import { IAdminUserRepository } from './interfaces/IAdminUserRepository'
import { IAdminInstructorRepository } from './interfaces/IAdminInstructorRepository'

/**
 * AdminRepository class extends the GenericRepository
 * and implements admin-specific operations like fetching admin,
 * managing users, and managing instructors.
 */
export class AdminRespository extends GenericRepository<IAdmin> implements IAdminRepository {
  private adminUserRepository: IAdminUserRepository
  private adminInstructorRepository: IAdminInstructorRepository

  constructor(
    adminUserRepository: IAdminUserRepository,
    adminInstructorRepository: IAdminInstructorRepository,
  ) {
    // Call the base GenericRepository with AdminModel
    super(AdminModel)

    // Assign user and instructor repository references
    this.adminUserRepository = adminUserRepository
    this.adminInstructorRepository = adminInstructorRepository
  }

  // Fetch admin details by email
  async getAdmin(email: string): Promise<IAdmin | null> {
    return await this.findOne({ email })
  }

  // Create a new admin
  async createAdmin(adminData: IAdmin): Promise<IAdmin | null> {
    return await this.create(adminData)
  }

  // Fetch all users with pagination and search
  async getAllUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const users = await this.adminUserRepository.getAllUsers(page, limit, search)
      return users
    } catch (error) {
      throw error
    }
  }

  // Fetch all instructors with pagination and search
  async getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }> {
    try {
      const instructors = await this.adminInstructorRepository.getAllInstructors(
        page,
        limit,
        search,
      )
      return instructors
    } catch (error) {
      throw error
    }
  }

  // Fetch specific user details by email
  async getUserData(email: string) {
    try {
      const response = await this.adminUserRepository.getUserData(email)
      return response
    } catch (error) {
      throw error
    }
  }

  // Fetch specific instructor details by email
  async getInstructorData(email: string) {
    try {
      const response = await this.adminInstructorRepository.getInstructorData(email)
      return response
    } catch (error) {
      throw error
    }
  }

  // Block or unblock user profile by updating fields
  async updateProfile(email: string, data: any): Promise<any> {
    try {
      const response = await this.adminUserRepository.updateProfile(email, data)
      return response
    } catch (error) {
      throw error
    }
  }

  // Block or unblock instructor profile by updating fields
  async updateInstructorProfile(email: string, data: any): Promise<any> {
    try {
      const response = await this.adminInstructorRepository.updateInstructorProfile(email, data)
      return response
    } catch (error) {
      throw error
    }
  }
}
