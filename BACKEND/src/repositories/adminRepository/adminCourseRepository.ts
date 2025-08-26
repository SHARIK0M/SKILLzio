import { IAdminCourseRepository } from './interfaces/IAdminCourseRepository'
import { ICourse, CourseModel } from '../../models/courseModel'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { ChapterDetailRepository } from '../genericRepo/ChapterRepository'
import { QuizDetailRepository } from '../genericRepo/QuizRepository'
import { IChapter } from '../../models/chapterModel'
import { IQuiz } from '../../models/quizModel'
import { getPresignedUrl } from '../../utils/getPresignedUrl'

// Repository for Admin-specific operations on courses
export class AdminCourseRepository
  extends GenericRepository<ICourse>
  implements IAdminCourseRepository
{
  private chapterDetailRepo: ChapterDetailRepository
  private quizDetailRepo: QuizDetailRepository

  constructor(chapterDetailRepo: ChapterDetailRepository, quizDetailRepo: QuizDetailRepository) {
    super(CourseModel)
    this.chapterDetailRepo = chapterDetailRepo
    this.quizDetailRepo = quizDetailRepo
  }

  // Fetch all courses with optional search, pagination, and sorted by creation date
  async getAllCourses(
    search = '',
    page = 1,
    limit = 10,
  ): Promise<{ data: ICourse[]; total: number }> {
    const filter = search ? { courseName: { $regex: search, $options: 'i' } } : {}
    return await this.paginate(filter, page, limit, { createdAt: -1 })
  }

  // Get detailed information of a course including chapters and quiz
  async getCourseDetails(courseId: string): Promise<{
    course: ICourse | null
    chapters: IChapter[]
    quiz: IQuiz | null
  }> {
    const course = await this.findById(courseId)
    if (!course) return { course: null, chapters: [], quiz: null }

    // Generate pre-signed URLs for demo video and thumbnail if they exist
    if (course.demoVideo?.url) {
      course.demoVideo.url = await getPresignedUrl(course.demoVideo.url)
    }
    if (course.thumbnailUrl) {
      course.thumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
    }

    // Fetch all chapters of the course
    const chapters = await this.chapterDetailRepo.find({ courseId })

    // Generate pre-signed URLs for chapter videos and captions
    for (const chapter of chapters) {
      if (chapter.videoUrl) {
        chapter.videoUrl = await getPresignedUrl(chapter.videoUrl)
      }
      if (chapter.captionsUrl) {
        chapter.captionsUrl = await getPresignedUrl(chapter.captionsUrl)
      }
    }

    // Fetch the quiz associated with the course
    const quiz = await this.quizDetailRepo.findOne({ courseId })

    return { course, chapters, quiz }
  }

  // Toggle the listing status of a course (listed/unlisted)
  async toggleListingStatus(courseId: string): Promise<ICourse | null> {
    const course = await this.findById(courseId)
    if (!course) return null

    return await this.update(courseId, { isListed: !course.isListed })
  }

  // Toggle the verification status of a course (verified/unverified)
  // When verified, the course is automatically listed; otherwise, it is unlisted
  async toggleVerificationStatus(courseId: string): Promise<ICourse | null> {
    const course = await this.findById(courseId)
    if (!course) return null

    const newVerificationStatus = !course.isVerified
    const updatedCourse = await this.update(courseId, {
      isVerified: newVerificationStatus,
      isListed: newVerificationStatus, // only allow listing if verified
    })

    return updatedCourse
  }
}
