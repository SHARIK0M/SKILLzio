import InstructorModel, { IInstructor } from '../../models/instructor.Model'
import { IAdminInstructorRepository } from './interfaces/IAdminInstructorRepository'
import { GenericRepository } from '../genericRepo/genericRepository'

export class AdminInstructorRepository
  extends GenericRepository<IInstructor>
  implements IAdminInstructorRepository
{
  constructor() {
    super(InstructorModel)
  }

  // Fetch all instructors with pagination and search
  async getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }> {
    try {
      const query = search
        ? {
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {}

      // Use the paginate method from GenericRepository
      const result = await this.paginate(
        query,
        page,
        limit,
        { createdAt: -1 }, // Sort by creation date descending
      )

      return {
        instructors: result.data,
        total: result.total,
      }
    } catch (error) {
      throw error
    }
  }

  // Get specified instructor data based on email
  async getInstructorData(email: string): Promise<IInstructor | null> {
    try {
      const instructorData = await this.findOne({ email: email })
      return instructorData
    } catch (error) {
      throw error
    }
  }

  // Block or unblock instructor
  async updateInstructorProfile(email: string, data: any): Promise<IInstructor | null> {
    try {
      const response = await this.updateOne({ email }, data)

      return response
    } catch (error) {
      throw error
    }
  }
}
