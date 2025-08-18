import { IAdminRepository } from './interfaces/IAdminRepository'  
import AdminModel, { IAdmin } from '../../models/admin.Model'
import { GenericRepository } from '../genericRepo/genericRepository' 
import { IUser } from '../../models/user.Model'
import { IInstructor } from '../../models/instructor.Model'
import { IAdminUserRepository } from './interfaces/IAdminUserRepository'
import { IAdminInstructorRepository } from './interfaces/IAdminInstructorRepository'

export class AdminRespository extends GenericRepository<IAdmin> implements IAdminRepository {

  private adminUserRepository: IAdminUserRepository
  private adminInstructorRepository: IAdminInstructorRepository
  
  constructor(adminUserRepository:IAdminUserRepository,adminInstructorRepository:IAdminInstructorRepository) {
    super(AdminModel)
    this.adminUserRepository = adminUserRepository
    this.adminInstructorRepository = adminInstructorRepository

  }

  async getAdmin(email: string): Promise<IAdmin | null> {
    return await this.findOne({ email })
  }

  async createAdmin(adminData: IAdmin): Promise<IAdmin | null> {
    return await this.create(adminData)
  }

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

  async getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }> {
    try {
      const instructors = await this.adminInstructorRepository.getAllInstructors(page, limit, search)
      return instructors
    } catch (error) {
      throw error
    }
  }

  async getUserData(email: string) {
    try {
      const response = await this.adminUserRepository.getUserData(email)

      return response
    } catch (error) {
      throw error
    }
  }

  async getInstructorData(email: string) {
    try {
      const response = await this.adminInstructorRepository.getInstructorData(email)

      return response
    } catch (error) {
      throw error
    }
  }

  //block or unblock

  async updateProfile(email: string, data: any): Promise<any> {
    try {
      const response = await this.adminUserRepository.updateProfile(email, data)
      return response
    } catch (error) {
      throw error
    }
  }

  async updateInstructorProfile(email: string, data: any): Promise<any> {
    try {
      const response = await this.adminInstructorRepository.updateInstructorProfile(email, data)
      return response
    } catch (error) {
      throw error
    }
  }
}