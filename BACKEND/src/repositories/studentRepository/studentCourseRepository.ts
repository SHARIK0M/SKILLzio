import { IStudentCourseRepository } from './interfaces/IStudentCourseRepository'
import { ICourse, CourseModel } from '../../models/courseModel'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { IChapterReadOnlyRepository } from './interfaces/IChapterReadOnlyRepository'
import { IQuizReadOnlyRepository } from './interfaces/IQuizReadOnlyRepository'
import { getPresignedUrl } from '../../utils/getPresignedUrl'

// Repository for student-facing course operations (read-only and filtered views)
export class StudentCourseRepository
  extends GenericRepository<ICourse>
  implements IStudentCourseRepository
{
  private chapterRepo: IChapterReadOnlyRepository
  private quizRepo: IQuizReadOnlyRepository

  constructor(chapterRepo: IChapterReadOnlyRepository, quizRepo: IQuizReadOnlyRepository) {
    super(CourseModel)
    this.chapterRepo = chapterRepo
    this.quizRepo = quizRepo
  }

  // Get all courses that are listed, published, and verified
  async getAllListedCourses(): Promise<
    { course: ICourse; chapterCount: number; quizQuestionCount: number }[]
  > {
    // Fetch courses with listing, publication, and verification filters
    const listedCourses = (await this.findAll(
      { isListed: true, isPublished: true, isVerified: true },
      ['category', 'instructorId'],
    )) as ICourse[]

    // Add chapter count, quiz question count, and signed thumbnail URL for each course
    const result = await Promise.all(
      listedCourses.map(async (course) => {
        const courseId = course._id.toString()
        const chapterCount = await this.chapterRepo.countChaptersByCourse(courseId)
        const quizQuestionCount = await this.quizRepo.countQuestionsByCourse(courseId)

        const signedThumbnailUrl = await getPresignedUrl(course.thumbnailUrl)

        return {
          course: {
            ...course.toObject(),
            thumbnailUrl: signedThumbnailUrl,
          },
          chapterCount,
          quizQuestionCount,
        }
      }),
    )

    console.log('All listed course ', result)

    return result
  }

  // Get courses based on pagination, search, sorting, and optional category filter
  async getFilteredCourses(
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
    // Build filter object
    const filter: any = {
      isListed: true,
      isPublished: true,
      isVerified: true,
    }

    // Add search filter if provided
    if (searchTerm) {
      filter.$or = [
        { courseName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ]
    }

    // Add category filter if provided
    if (categoryId) {
      filter.category = categoryId
    }

    // Determine sort options
    let sortOption: any = { createdAt: -1 }
    switch (sort) {
      case 'name-asc':
        sortOption = { courseName: 1 }
        break
      case 'name-desc':
        sortOption = { courseName: -1 }
        break
      case 'price-asc':
        sortOption = { price: 1 }
        break
      case 'price-desc':
        sortOption = { price: -1 }
        break
    }

    // Fetch paginated courses from database
    const { data: courses, total } = await this.paginate(filter, page, limit, sortOption, [
      'category',
      'instructorId',
    ])

    // Add chapter count, quiz question count, and signed thumbnail URL for each course
    const result = await Promise.all(
      courses.map(async (course) => {
        const chapterCount = await this.chapterRepo.countChaptersByCourse(course._id.toString())
        const quizQuestionCount = await this.quizRepo.countQuestionsByCourse(course._id.toString())
        const signedThumbnailUrl = await getPresignedUrl(course.thumbnailUrl)

        return {
          course: {
            ...course.toObject(),
            thumbnailUrl: signedThumbnailUrl,
          },
          chapterCount,
          quizQuestionCount,
        }
      }),
    )

    console.log('Filtered Course ', result)

    return { data: result, total }
  }

  // Get detailed information about a specific course
  async getCourseDetails(courseId: string): Promise<{
    course: ICourse | null
    chapterCount: number
    quizQuestionCount: number
  }> {
    // Fetch course and populate category and instructor references
    const course = await this.findByIdWithPopulate(courseId, ['category', 'instructorId'])
    if (!course) return { course: null, chapterCount: 0, quizQuestionCount: 0 }

    // Count chapters and quiz questions for the course
    const chapterCount = await this.chapterRepo.countChaptersByCourse(courseId)
    const quizQuestionCount = await this.quizRepo.countQuestionsByCourse(courseId)

    // Generate signed URLs for thumbnail and demo video
    const signedThumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
    const signedDemoVideoUrl = await getPresignedUrl(course.demoVideo.url)

    course.thumbnailUrl = signedThumbnailUrl
    course.demoVideo.url = signedDemoVideoUrl

    return { course, chapterCount, quizQuestionCount }
  }
}
