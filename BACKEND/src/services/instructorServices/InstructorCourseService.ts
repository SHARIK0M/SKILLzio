import { ICourse } from '../../models/courseModel'
import { IInstructorCourseService } from './interfaces/IInstructorCourseService'
import { IInstructorCourseRepository } from '../../repositories/instructorRepository/interfaces/IInstructorCourseRepository'
import { IInstructorChapterRepository } from '../../repositories/instructorRepository/interfaces/IInstructorChapterRepository'
import { IInstructorQuizRepository } from '../../repositories/instructorRepository/interfaces/IInstructorQuizRepository'

// Service layer handling instructor-specific course operations
export class InstructorCourseService implements IInstructorCourseService {
  private courseRepository: IInstructorCourseRepository
  private chapterRepository: IInstructorChapterRepository
  private quizRepository: IInstructorQuizRepository

  constructor(
    courseRepository: IInstructorCourseRepository,
    chapterRepository: IInstructorChapterRepository,
    quizRepository: IInstructorQuizRepository,
  ) {
    this.courseRepository = courseRepository
    this.chapterRepository = chapterRepository
    this.quizRepository = quizRepository
  }

  // Create a new course
  async createCourse(courseData: ICourse): Promise<ICourse> {
    return await this.courseRepository.createCourse(courseData)
  }

  // Update an existing course
  async updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
    return await this.courseRepository.updateCourse(courseId, courseData)
  }

  // Delete a course by its ID
  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await this.courseRepository.deleteCourse(courseId)
  }

  // Get a course by its ID
  async getCourseById(courseId: string): Promise<ICourse | null> {
    return await this.courseRepository.getCourseById(courseId)
  }

  // Get paginated list of courses for a specific instructor, with optional search
  async getInstructorCoursesPaginated(
    instructorId: string,
    page: number,
    limit: number,
    search: string = '',
  ): Promise<{ data: ICourse[]; total: number }> {
    return await this.courseRepository.getCoursesByInstructorWithPagination(
      instructorId,
      page,
      limit,
      search,
    )
  }

  // Check if a course with the same name already exists for the instructor
  async isCourseAlreadyCreatedByInstructor(
    courseName: string,
    instructorId: string,
  ): Promise<boolean> {
    const existing = await this.courseRepository.findCourseByNameForInstructor(
      courseName,
      instructorId,
    )
    return !!existing
  }

  // Check if a course with the same name already exists for the instructor, excluding a specific course ID (useful for updates)
  async isCourseAlreadyCreatedByInstructorExcluding(
    courseName: string,
    instructorId: string,
    courseId: string,
  ): Promise<boolean> {
    const existing = await this.courseRepository.findCourseByNameForInstructorExcludingId(
      courseName,
      instructorId,
      courseId,
    )
    return !!existing
  }

  // Check if a course can be published (must have chapters and a quiz with at least one question)
  async canPublishCourse(courseId: string): Promise<boolean> {
    const chapters = await this.chapterRepository.getChaptersByCourse(courseId)
    const quiz = await this.quizRepository.getQuizByCourseId(courseId)
    return (
      chapters.length > 0 && !!quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0
    )
  }

  // Publish a course (mark it as published)
  async publishCourse(courseId: string): Promise<ICourse | null> {
    return await this.courseRepository.updateCourse(courseId, { isPublished: true })
  }
}
