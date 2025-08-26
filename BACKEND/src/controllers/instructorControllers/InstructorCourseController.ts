import { Request, Response, NextFunction } from 'express'
import { IInstructorCourseController } from './interfaces/IInstructorCourseController'
import { IInstructorCourseService } from '../../services/instructorServices/interfaces/IInstructorCourseService'
import getId from '../../utils/getId'
import { StatusCode } from '../../types/enums'
import { CourseErrorMessages, CourseSuccessMessages } from '../../types/constants'
import { uploadToS3Bucket } from '../../utils/s3Bucket'
import { getPresignedUrl } from '../../utils/getPresignedUrl'

// Controller responsible for handling course operations for instructors
export class InstructorCourseController implements IInstructorCourseController {
  constructor(private courseService: IInstructorCourseService) {}

  // Create a new course
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseData = req.body
      const instructorId = await getId(req)

      // Check if instructor is authenticated
      if (!instructorId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: Instructor ID not found.',
        })
        return
      }

      const files = req.files as {
        demoVideos?: Express.Multer.File[]
        thumbnail?: Express.Multer.File[]
      }

      // Check if required files are uploaded
      if (!files?.thumbnail || !files?.demoVideos) {
        res.status(StatusCode.BAD_REQUEST).json({ message: CourseErrorMessages.MISSING_FILES })
        return
      }

      // Normalize course name
      const courseName = courseData.courseName?.trim().toLowerCase()

      // Check if the instructor has already created a course with the same name
      const isAlreadyCreated = await this.courseService.isCourseAlreadyCreatedByInstructor(
        courseName,
        instructorId,
      )
      if (isAlreadyCreated) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'You have already created a course with this name.',
        })
        return
      }

      // Upload thumbnail and demo video to S3
      const thumbnailKey = await uploadToS3Bucket(files.thumbnail[0], 'thumbnails')
      const demoVideoKey = await uploadToS3Bucket(files.demoVideos[0], 'demoVideos')

      // Set course details
      courseData.courseName = courseName
      courseData.instructorId = instructorId
      courseData.thumbnailUrl = thumbnailKey
      courseData.demoVideo = {
        type: 'video',
        url: demoVideoKey,
      }

      // Create course in database
      const createdCourse = await this.courseService.createCourse(courseData)

      res.status(StatusCode.CREATED).json({
        success: true,
        message: CourseSuccessMessages.COURSE_CREATED,
        data: createdCourse,
      })
    } catch (error) {
      next(error)
    }
  }

  // Update course details
  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const courseData = req.body
      const instructorId = await getId(req)

      if (!instructorId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: Instructor ID not found.',
        })
        return
      }

      const courseName = courseData.courseName?.trim().toLowerCase()

      // Check if instructor already has another course with the same name
      const isDuplicate = await this.courseService.isCourseAlreadyCreatedByInstructorExcluding(
        courseName,
        instructorId,
        courseId,
      )

      if (isDuplicate) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'You have already created another course with this name.',
        })
        return
      }

      const files = req.files as {
        demoVideos?: Express.Multer.File[]
        thumbnail?: Express.Multer.File[]
      }

      // Upload new thumbnail if provided
      if (files?.thumbnail) {
        const thumbnailKey = await uploadToS3Bucket(files.thumbnail[0], 'thumbnails')
        courseData.thumbnailUrl = thumbnailKey
      }

      // Upload new demo video if provided
      if (files?.demoVideos) {
        const demoVideoKey = await uploadToS3Bucket(files.demoVideos[0], 'demoVideos')
        courseData.demoVideo = {
          type: 'video',
          url: demoVideoKey,
        }
      }

      courseData.courseName = courseName

      // Update course in database
      const updatedCourse = await this.courseService.updateCourse(courseId, courseData)

      if (!updatedCourse) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: CourseErrorMessages.COURSE_NOT_FOUND,
        })
        return
      }

      // Generate presigned URLs for thumbnail and demo video
      const thumbnailSignedUrl = updatedCourse.thumbnailUrl
        ? await getPresignedUrl(updatedCourse.thumbnailUrl)
        : null

      const demoVideoSignedUrl = updatedCourse.demoVideo?.url
        ? await getPresignedUrl(updatedCourse.demoVideo.url)
        : null

      res.status(StatusCode.OK).json({
        success: true,
        message: CourseSuccessMessages.COURSE_UPDATED,
        data: {
          ...updatedCourse.toObject(),
          thumbnailSignedUrl,
          demoVideo: {
            ...updatedCourse.demoVideo,
            urlSigned: demoVideoSignedUrl,
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete a course
  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const deleted = await this.courseService.deleteCourse(courseId)

      if (!deleted) {
        res.status(StatusCode.NOT_FOUND).json({ message: CourseErrorMessages.COURSE_NOT_FOUND })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: CourseSuccessMessages.COURSE_DELETED,
      })
    } catch (error) {
      next(error)
    }
  }

  // Get course details by ID, including presigned URLs
  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const course = await this.courseService.getCourseById(courseId)

      if (!course) {
        res.status(StatusCode.NOT_FOUND).json({ message: CourseErrorMessages.COURSE_NOT_FOUND })
        return
      }

      const courseObj = course.toObject()

      const thumbnailSignedUrl = courseObj.thumbnailUrl
        ? await getPresignedUrl(courseObj.thumbnailUrl)
        : null

      const demoVideoSignedUrl = courseObj.demoVideo?.url
        ? await getPresignedUrl(courseObj.demoVideo.url)
        : null

      const responseData = {
        ...courseObj,
        thumbnailSignedUrl,
        demoVideo: {
          ...courseObj.demoVideo,
          urlSigned: demoVideoSignedUrl,
        },
      }

      res.status(StatusCode.OK).json({ success: true, data: responseData })
    } catch (error) {
      next(error)
    }
  }

  // Get all courses created by the instructor with pagination
  async getInstructorCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = await getId(req)
      if (!instructorId) {
        res.status(401).json({ success: false, message: 'Unauthorized' })
        return
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''

      const { data, total } = await this.courseService.getInstructorCoursesPaginated(
        instructorId,
        page,
        limit,
        search,
      )

      // Generate presigned URLs for course thumbnails
      const coursesWithSignedUrl = await Promise.all(
        data.map(async (course) => {
          const signedUrl = await getPresignedUrl(course.thumbnailUrl)
          const courseObj = course.toObject()
          return {
            ...courseObj,
            thumbnailSignedUrl: signedUrl,
            categoryName: courseObj.category?.categoryName,
          }
        }),
      )

      res.status(200).json({
        success: true,
        data: coursesWithSignedUrl,
        total,
        page,
        limit,
      })
    } catch (err) {
      next(err)
    }
  }

  // Publish course if it has at least one chapter and one quiz question
  async publishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params

      const canPublish = await this.courseService.canPublishCourse(courseId)

      if (!canPublish) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Course must have at least one chapter and one quiz question to be published',
        })
        return
      }

      const updatedCourse = await this.courseService.publishCourse(courseId)

      if (!updatedCourse) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: CourseErrorMessages.COURSE_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Course published successfully',
        data: updatedCourse,
      })
    } catch (error) {
      next(error)
    }
  }
}
