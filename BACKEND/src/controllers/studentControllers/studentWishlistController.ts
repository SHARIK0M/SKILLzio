import { Response } from 'express'
import { Types } from 'mongoose'
import { IStudentWishlistController } from './interfaces/IStudentWishlistController'
import { IStudentWishlistService } from '../../services/studentServices/interfaces/IStudentWishlistService'
import { StatusCode } from '../../types/enums'
import {
  WishlistSuccessMessage,
  WishlistErrorMessage,
  StudentErrorMessages,
} from '../../types/constants'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { ICourse } from '../../models/courseModel'

// Controller for handling student wishlist operations
export class StudentWishlistController implements IStudentWishlistController {
  private wishlistService: IStudentWishlistService

  constructor(wishlistService: IStudentWishlistService) {
    this.wishlistService = wishlistService
  }

  // Add a course to student's wishlist
  async addToWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('i am running')
      console.log(req.body)

      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.body.courseId)

      // Check if the course already exists in wishlist
      const exists = await this.wishlistService.isCourseInWishlist(userId, courseId)
      if (exists) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message: WishlistErrorMessage.COURSE_ALREADY_IN_WISHLIST,
        })
        return
      }

      // Add course to wishlist
      const result = await this.wishlistService.addToWishlist(userId, courseId)
      res.status(StatusCode.CREATED).json({
        success: true,
        message: WishlistSuccessMessage.COURSE_ADDED,
        data: result,
      })
    } catch (error) {
      console.error('addToWishlist error:', error)
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: StudentErrorMessages.TOKEN_INVALID,
      })
    }
  }

  // Remove a course from student's wishlist
  async removeFromWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      await this.wishlistService.removeFromWishlist(userId, courseId)
      res.status(StatusCode.OK).json({
        success: true,
        message: WishlistSuccessMessage.COURSE_REMOVED,
      })
    } catch (error) {
      console.error('removeFromWishlist error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: WishlistErrorMessage.FAILED_TO_REMOVE_COURSE,
      })
    }
  }

  // Fetch all courses in student's wishlist
  async getWishlistCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)

      const wishlist = await this.wishlistService.getWishlistCourses(userId)

      // Generate signed URLs for course thumbnails
      for (const item of wishlist) {
        const course = item.courseId as ICourse
        if (course?.thumbnailUrl) {
          course.thumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
        }
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: WishlistSuccessMessage.COURSE_LIST_FETCHED,
        data: wishlist,
      })
    } catch (error) {
      console.error('getWishlistCourses error:', error)
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: StudentErrorMessages.TOKEN_INVALID,
      })
    }
  }

  // Check if a specific course exists in student's wishlist
  async isCourseInWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      const exists = await this.wishlistService.isCourseInWishlist(userId, courseId)
      res.status(StatusCode.OK).json({
        success: true,
        exists,
      })
    } catch (error) {
      console.error('isCourseInWishlist error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: WishlistErrorMessage.FAILED_TO_CHECK_EXISTENCE,
      })
    }
  }
}
