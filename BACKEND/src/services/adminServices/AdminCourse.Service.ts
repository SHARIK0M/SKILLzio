import { IAdminCourseService } from './interfaces/IAdminCourseService' 
import { IAdminCourseRepository } from '../../repositories/adminRepository/interfaces/IAdminCourseRepository' 
import { ICourse } from '../../models/course.Model'
import { IChapter } from '../../models/chapter.Model'
import { IQuiz } from '../../models/quiz.Model'

export class AdminCourseService implements IAdminCourseService {
  
  constructor(private readonly courseRepository: IAdminCourseRepository) {}

  async fetchAllCourses(
    search = '',
    page = 1,
    limit = 10,
  ): Promise<{ data: ICourse[]; total: number }> {
    return await this.courseRepository.getAllCourses(search, page, limit)
  }

  async getCourseDetails(courseId: string): Promise<{
    course: ICourse | null
    chapters: IChapter[]
    quiz: IQuiz | null
  }> {
    return await this.courseRepository.getCourseDetails(courseId)
  }

  async toggleCourseListing(courseId: string): Promise<ICourse | null> {
    return await this.courseRepository.toggleListingStatus(courseId)
  }

  async toggleCourseVerification(courseId: string): Promise<ICourse | null> {
    return await this.courseRepository.toggleVerificationStatus(courseId)
  }
}
