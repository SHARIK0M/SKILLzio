import InstructorModel, { IInstructor } from '../../models/instructor.Model'
import { IAdminInstructorRepository } from './interfaces/IAdminInstructorRepository'
import { GenericRepository } from '../genericRepo/generic.Repository'

// Repository class for handling instructor-related admin operations.
// Extends the GenericRepository to reuse common database methods.
export class AdminInstructorRepository
  extends GenericRepository<IInstructor>
  implements IAdminInstructorRepository
{
  constructor() {
    // Pass the InstructorModel to the parent GenericRepository
    super(InstructorModel)
  }

  // Fetch all instructors with pagination and optional search.
  // - page: current page number
  // - limit: number of results per page
  // - search: search keyword (optional) for username or email
  async getAllInstructors(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ instructors: IInstructor[]; total: number }> {
    try {
      // If a search term is provided, create a filter query.
      // Matches username or email containing the search string (case insensitive).
      const query = search
        ? {
            $or: [
              { username: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {}

      // Use the paginate method from GenericRepository for pagination.
      // Sorted by creation date in descending order (latest first).
      const result = await this.paginate(query, page, limit, { createdAt: -1 })

      // Return the instructors and the total count.
      return {
        instructors: result.data,
        total: result.total,
      }
    } catch (error) {
      // Forward the error to be handled at a higher level.
      throw error
    }
  }

  // Get details of a single instructor based on email.
  async getInstructorData(email: string): Promise<IInstructor | null> {
    try {
      // Find an instructor whose email matches.
      const instructorData = await this.findOne({ email: email })
      return instructorData
    } catch (error) {
      throw error
    }
  }

  // Update instructor profile (e.g., block/unblock).
  // - email: instructor's email
  // - data: fields to update
  async updateInstructorProfile(email: string, data: any): Promise<IInstructor | null> {
    try {
      // Update instructor data by matching email.
      const response = await this.updateOne({ email }, data)
      return response
    } catch (error) {
      throw error
    }
  }
}
