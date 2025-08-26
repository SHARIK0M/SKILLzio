import { ICourse } from '../../../models/course.Model'; 
import { IChapter } from '../../../models/chapter.Model'; 
import { IQuiz } from '../../../models/quiz.Model'; 
export interface IAdminCourseRepository {
  getAllCourses(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: ICourse[]; total: number }>

  getCourseDetails(courseId: string): Promise<{
    course: ICourse | null
    chapters: IChapter[]
    quiz: IQuiz | null
  }>

  toggleListingStatus(courseId: string): Promise<ICourse | null>
  toggleVerificationStatus(courseId: string): Promise<ICourse | null>
}
