import InstructorModel, { IInstructor, IInstructorDTO } from '../../models/instructor.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import IInstructorRepository from './interfaces/IInstructorRepository'
import { InstructorErrorMessages } from '../../utils/constants'
import bcrypt from 'bcryptjs'

// Repository class for Instructor-related database operations
export default class InstructorRepository
  extends GenericRepository<IInstructor>
  implements IInstructorRepository
{
  constructor() {
    // Pass the Instructor model to the GenericRepository
    super(InstructorModel)
  }

  // Find instructor by email
  async findByEmail(email: string): Promise<IInstructor | null> {
    return await this.findOne({ email })
  }

  // Create a new instructor (used during signup or Google login)
  async createUser(userData: IInstructorDTO): Promise<IInstructor | null> {
    return await this.create(userData)
  }

  // Reset instructor's password using email
  async resetPassword(email: string, password: string): Promise<IInstructor | null> {
    try {
      // Find instructor by email
      const instructor = await this.findOne({ email })

      // If not found, throw an error
      if (!instructor) {
        throw new Error(InstructorErrorMessages.USER_NOT_FOUND)
      }

      // Convert MongoDB ObjectId to string
      const instructorId = instructor._id as unknown as string

      // Update instructor's password
      return await this.update(instructorId, { password })
    } catch (error) {
      throw error
    }
  }

  // Login using Google (auto-create user if not already exists)
  async googleLogin(name: string, email: string): Promise<IInstructor | null> {
    try {
      // Check if instructor already exists
      const instructor = await this.findByEmail(email)

      // Use Google name as username
      const username = name

      // If instructor does not exist, create a new one
      if (!instructor) {
        // Generate a temporary random password
        const tempPassword = Date.now().toString() + Math.floor(Math.random() * 10000).toString()

        // Hash the temporary password before saving
        const hashedPassword = await bcrypt.hash(tempPassword, 10)

        // Create new instructor with Google details
        const newInstructor = await this.createUser({ username, email, password: hashedPassword })

        return newInstructor
      }

      // If already exists, return existing instructor
      return instructor
    } catch (error) {
      throw error
    }
  }

  // Update instructor details using email
  async updateByEmail(email: string, data: Partial<IInstructor>): Promise<IInstructor | null> {
    return await this.updateOne({ email }, data)
  }
}
