// Import required interfaces and models
import { IAdminService } from './interfaces/IAdminService'
import { IAdmin } from '../../models/admin.Model'
import { IAdminRepository } from '../../repositories/adminRepository/interfaces/IAdminRepository'
import { IInstructor } from '../../models/instructor.Model'
import { IUser } from '../../models/user.Model'

// AdminService class implements IAdminService interface
export class AdminService implements IAdminService {
  private adminRepository: IAdminRepository // reference to the repository layer

  // constructor receives adminRepository instance (Dependency Injection)
  constructor(adminRepository: IAdminRepository) {
    this.adminRepository = adminRepository
  }

  // Fetch admin data using email
  async getAdminData(email: string): Promise<IAdmin | null> {
    return await this.adminRepository.getAdmin(email)
  }

  // Create a new admin account
  async createAdmin(adminData: IAdmin): Promise<IAdmin | null> {
    return await this.adminRepository.createAdmin(adminData)
  }

  // Get all users with pagination and optional search
  async getAllUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ users: IUser[]; total: number }> {
    return await this.adminRepository.getAllUsers(page, limit, search)
  }

  // Get all instructors with pagination and optional search
  async getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }> {
    return await this.adminRepository.getAllInstructors(page, limit, search)
  }

  // Get specific user details based on email
  async getUserData(email: string): Promise<IUser | null> {
    return this.adminRepository.getUserData(email)
  }

  // Get specific instructor details based on email
  async getInstructorData(email: string): Promise<IInstructor | null> {
    return await this.adminRepository.getInstructorData(email)
  }

  // Block or unblock a user by updating profile fields
  async updateProfile(email: string, data: any): Promise<any> {
    return await this.adminRepository.updateProfile(email, data)
  }

  // Block or unblock an instructor by updating profile fields
  async updateInstructorProfile(email: string, data: any): Promise<any> {
    return await this.adminRepository.updateInstructorProfile(email, data)
  }
}
