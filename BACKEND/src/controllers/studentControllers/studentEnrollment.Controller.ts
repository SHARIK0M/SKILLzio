import { Response } from 'express'
import { IStudentEnrollmentController } from './interfaces/IStudentEnrollmentController'
import { IStudentEnrollmentService } from '../../services/studentServices/interfaces/IStudentEnrollmentService'
import { StatusCode } from '../../types/enums'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { Types } from 'mongoose'
import { EnrolledErrorMessage } from '../../types/constants'
import { getPresignedUrl } from '../../utils/getPresignedUrl'

// Controller to manage student enrollments and course progress
export class StudentEnrollmentController implements IStudentEnrollmentController {
  private enrollmentService: IStudentEnrollmentService

  // Dependency injection of enrollment service
  constructor(enrollmentService: IStudentEnrollmentService) {
    this.enrollmentService = enrollmentService
  }

  // Fetch all enrolled courses of a student
  async getAllEnrolledCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)

      // Get enrolled courses from service
      const courses = await this.enrollmentService.getAllEnrolledCourses(userId)

      // Generate presigned URLs for thumbnails (so students can access them securely)
      for (const enroll of courses) {
        const course: any = enroll.courseId
        if (course?.thumbnailUrl) {
          course.thumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
        }
      }

      res.status(StatusCode.OK).json({ success: true, courses })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: EnrolledErrorMessage.FAILED_TO_FETCH_ENROLLED_COURSES,
      })
    }
  }

  // Fetch details of a specific enrolled course
  async getEnrollmentCourseDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      // Get enrollment details from service
      const enrollment = await this.enrollmentService.getEnrollmentCourseWithDetails(
        userId,
        courseId,
      )

      if (!enrollment) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found',
        })
        return
      }

      const course: any = enrollment.courseId

      // Generate presigned URL for course thumbnail
      if (course.thumbnailUrl) {
        course.thumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
      }

      // Generate presigned URL for demo video
      if (course.demoVideo?.url) {
        course.demoVideo.url = await getPresignedUrl(course.demoVideo.url)
      }

      // Generate presigned URLs for chapter videos
      if (course.chapters?.length > 0) {
        for (const chapter of course.chapters) {
          if (chapter.videoUrl) {
            chapter.videoUrl = await getPresignedUrl(chapter.videoUrl)
          }
        }
      }

      console.log('enrollment', enrollment)

      res.status(StatusCode.OK).json({ success: true, enrollment })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: EnrolledErrorMessage.FAILED_TO_FETCH_PARTICULAR_COURSE,
      })
    }
  }

  // Mark a chapter as completed for the student
  async completeChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const { courseId, chapterId } = req.body

      // Update enrollment progress by marking chapter as completed
      const updatedEnrollment = await this.enrollmentService.completeChapter(
        userId,
        new Types.ObjectId(courseId),
        new Types.ObjectId(chapterId),
      )

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Chapter marked as completed',
        enrollment: updatedEnrollment,
      })
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: EnrolledErrorMessage.FAILED_TO_MARK_CHAPTER_COMPLETED,
      })
    }
  }

  // Submit quiz results for a student in a specific course
  async submitQuizResult(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const { courseId, quizId, correctAnswers, totalQuestions } = req.body

      // Validate required quiz data
      if (!courseId || !quizId || correctAnswers == null || totalQuestions == null) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Missing quiz result data',
        })
        return
      }

      // Calculate quiz score percentage
      const scorePercentage = (correctAnswers / totalQuestions) * 100

      // Save quiz result in enrollment record
      const enrollment = await this.enrollmentService.submitQuizResult(
        userId,
        new Types.ObjectId(courseId),
        {
          quizId: new Types.ObjectId(quizId),
          correctAnswers,
          totalQuestions,
          scorePercentage,
        },
      )

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Quiz result submitted',
        enrollment,
      })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to submit quiz result',
      })
    }
  }

  // Check if all chapters in a course are completed by the student
  async checkAllChaptersCompleted(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      // Verify if all chapters are marked as completed
      const allCompleted = await this.enrollmentService.areAllChaptersCompleted(userId, courseId)

      res.status(StatusCode.OK).json({ success: true, allCompleted })
    } catch (err) {
      console.log(err)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to check chapter completion',
      })
    }
  }

  // Fetch certificate download URL for completed courses
  async getCertificateUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      // Fetch enrollment with certificate details
      const enrollment = await this.enrollmentService.getEnrollmentCourseWithDetails(
        userId,
        courseId,
      )

      // Validate certificate availability
      if (!enrollment || !enrollment.certificateGenerated || !enrollment.certificateUrl) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Certificate not available yet',
        })
        return
      }

      // Generate presigned URL for secure certificate download
      const presignedCertificateUrl = await getPresignedUrl(enrollment.certificateUrl)

      res.status(StatusCode.OK).json({
        success: true,
        certificateUrl: presignedCertificateUrl,
      })
    } catch (error) {
      console.error(error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch certificate',
      })
    }
  }
}
