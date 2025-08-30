import { IStudentInstructorListingRepository } from './interfaces/IStudentInstructorListingRepository'
import InstructorModel, { IInstructor } from '../../models/instructor.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { PipelineStage } from 'mongoose'

// Repository class for handling instructor listing operations for students
export class StudentInstructorListingRepository
  extends GenericRepository<IInstructor>
  implements IStudentInstructorListingRepository
{
  constructor() {
    // Pass Instructor model to the generic repository
    super(InstructorModel)
  }

  // Fetch mentors with pagination, search, sorting, and filtering by skill/expertise
  async listMentorInstructorsPaginated(
    page: number,
    limit: number,
    search?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    skill?: string,
    expertise?: string,
  ): Promise<{ data: IInstructor[]; total: number }> {
    const match: any = {
      isMentor: true, // Only mentors
      isBlocked: false, // Exclude blocked instructors
    }

    // Apply search filter (case-insensitive match on username)
    if (search) {
      match.username = { $regex: search, $options: 'i' }
    }

    // Apply skill filter if provided
    if (skill) {
      match.skills = skill
    }

    // Apply expertise filter if provided
    if (expertise) {
      match.expertise = expertise
    }

    // Aggregation pipeline for filtering, sorting, and pagination
    const pipeline: PipelineStage[] = [
      { $match: match }, // Apply filters
      {
        $addFields: {
          usernameLower: { $toLower: '$username' }, // Convert username to lowercase for case-insensitive sorting
        },
      },
      {
        $sort: {
          usernameLower: sortOrder === 'desc' ? -1 : 1, // Sort usernames
        },
      },
      { $skip: (page - 1) * limit }, // Skip documents for pagination
      { $limit: limit }, // Limit documents per page
    ]

    // Run aggregation and count queries in parallel
    const [data, total] = await Promise.all([
      this.aggregate<IInstructor>(pipeline), // Get paginated instructors
      this.countDocuments(match), // Get total count of mentors matching filters
    ])

    return { data, total }
  }

  // Find a single mentor by ID (must be mentor and not blocked)
  async getMentorInstructorById(id: string): Promise<IInstructor | null> {
    return await this.findOne({ _id: id, isMentor: true, isBlocked: false })
  }

  // Fetch all available skills and expertise values from mentor instructors
  async getAvailableSkillsAndExpertise(): Promise<{
    skills: string[]
    expertise: string[]
  }> {
    // Pipeline to extract unique skills
    const skillsPipeline: PipelineStage[] = [
      { $match: { isMentor: true, isBlocked: false } },
      { $unwind: '$skills' }, // Break down array values
      { $group: { _id: '$skills' } }, // Group unique values
      { $project: { _id: 0, skill: '$_id' } }, // Rename field
    ]

    // Pipeline to extract unique expertise values
    const expertisePipeline: PipelineStage[] = [
      { $match: { isMentor: true, isBlocked: false } },
      { $unwind: '$expertise' },
      { $group: { _id: '$expertise' } },
      { $project: { _id: 0, expertise: '$_id' } },
    ]

    // Run both pipelines in parallel
    const [skillsResult, expertiseResult] = await Promise.all([
      this.aggregate<{ skill: string }>(skillsPipeline),
      this.aggregate<{ expertise: string }>(expertisePipeline),
    ])

    // Return arrays of skills and expertise
    return {
      skills: skillsResult.map((s) => s.skill),
      expertise: expertiseResult.map((e) => e.expertise),
    }
  }
}
