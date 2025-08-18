import UserModel, { IUser } from '../../models/user.Model'
import { GenericRepository } from '../genericRepo/genericRepository'
import { IAdminUserRepository } from './interfaces/IAdminUserRepository'

export class AdminUserRepository extends GenericRepository<IUser> implements IAdminUserRepository {
  constructor() {
    super(UserModel)
  }

  // Fetch all users and instructors
  async getAllUsers(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      let query = {}

      if (search && search.trim() !== '') {
        query = {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      }

      const total = await this.countDocuments(query)

      // Use createQuery method to get the query object for chaining
      const users = await this.createQuery(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })

      return { users, total }
    } catch (error) {
      throw error
    }
  }

  // Get specified data based on email
  async getUserData(email: string): Promise<IUser | null> {
    try {
      const userData = await this.findOne({ email: email })
      return userData
    } catch (error) {
      throw error
    }
  }

  // Block or unblock
  async updateProfile(email: string, data: any): Promise<any> {
    try {
      const response = await this.findOneAndUpdate({ email }, { $set: data }, { new: true })

      return response
    } catch (error) {
      throw error
    }
  }
}
