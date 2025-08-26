import { IStudentCourseService } from './interfaces/IStudentCourseService'
import { IStudentCourseRepository } from '../../repositories/studentRepository/interfaces/IStudentCourseRepository'
import { ICourse } from '../../models/course.Model'

// Service layer handling student-specific course operations
export class StudentCourseService implements IStudentCourseService {
  private studentCourseRepo: IStudentCourseRepository

  constructor(studentCourseRepo: IStudentCourseRepository) {
    this.studentCourseRepo = studentCourseRepo
  }

  // Get all listed courses with details like chapter count and quiz question count
  async getAllCoursesWithDetails(): Promise<
    {
      course: ICourse
      chapterCount: number
      quizQuestionCount: number
    }[]
  > {
    return await this.studentCourseRepo.getAllListedCourses()
  }

  // Get filtered and paginated courses with details
  // Allows search by course name/description, sorting, and filtering by category
  async getFilteredCoursesWithDetails(
    page: number,
    limit: number,
    searchTerm = '',
    sort: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' = 'name-asc',
    categoryId?: string,
  ): Promise<{
    data: {
      course: ICourse
      chapterCount: number
      quizQuestionCount: number
    }[]
    total: number
  }> {
    return await this.studentCourseRepo.getFilteredCourses(
      page,
      limit,
      searchTerm,
      sort,
      categoryId,
    )
  }

  // Get course details by ID including chapter count and quiz question count
  async getCourseDetailsById(courseId: string): Promise<{
    course: ICourse | null
    chapterCount: number
    quizQuestionCount: number
  }> {
    return await this.studentCourseRepo.getCourseDetails(courseId)
  }
}
