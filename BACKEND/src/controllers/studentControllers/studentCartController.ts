import { Response } from 'express'
import { Types } from 'mongoose'
import { IStudentCartService } from '../../services/studentServices/interfaces/IStudentCartService'
import { IStudentCartController } from './interfaces/IStudentCartController'
import { StatusCode } from '../../types/enums'
import { CartErrorMessage, CartSuccessMessage, StudentErrorMessages } from '../../types/constants'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'

// Controller for managing student cart operations
export class StudentCartController implements IStudentCartController {
  private cartService: IStudentCartService

  constructor(cartService: IStudentCartService) {
    this.cartService = cartService
  }

  // Get all courses in the student's cart
  async getCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const cart = await this.cartService.getCart(userId)

      // Generate signed URLs for course thumbnails if available
      if (cart) {
        for (const course of cart.courses as any[]) {
          if (course.thumbnailUrl) {
            course.thumbnailUrl = await getPresignedUrl(course.thumbnailUrl)
          }
        }

        res.status(StatusCode.OK).json({
          success: true,
          message: CartSuccessMessage.CART_DATA_FETCHED,
          data: cart,
        })
      } else {
        // Cart is empty
        res.status(StatusCode.OK).json({
          success: true,
          message: CartSuccessMessage.CART_EMPTY,
          data: null,
        })
      }
    } catch (error) {
      console.error('getCart error:', error)
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: StudentErrorMessages.TOKEN_INVALID,
      })
    }
  }

  // Add a course to the student's cart
  async addToCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.body.courseId)

      const cart = await this.cartService.getCart(userId)
      const alreadyInCart = cart?.courses.some((c) => c.toString() === courseId.toString())

      if (alreadyInCart) {
        // Course already exists in cart
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message: CartErrorMessage.COURSE_ALREADYEXIST_IN_CART,
        })
        return
      }

      const updatedCart = await this.cartService.addToCart(userId, courseId)
      res.status(StatusCode.OK).json({
        success: true,
        message: CartSuccessMessage.COURSE_ADDED_IN_CART,
        data: updatedCart,
      })
    } catch (error) {
      console.error('addToCart error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CartErrorMessage.FAILED_TO_ADD_COURSE_IN_CART,
      })
    }
  }

  // Remove a course from the student's cart
  async removeFromCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const courseId = new Types.ObjectId(req.params.courseId)

      const updatedCart = await this.cartService.removeFromCart(userId, courseId)
      res.status(StatusCode.OK).json({
        success: true,
        message: CartSuccessMessage.COURSE_REMOVED_FROM_CART,
        data: updatedCart,
      })
    } catch (error) {
      console.error('removeFromCart error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CartErrorMessage.FAILED_TO_REMOVE_COURSE_FROM_CART,
      })
    }
  }

  // Clear all courses from the student's cart
  async clearCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user?.id)
      const clearedCart = await this.cartService.clearCart(userId)
      res.status(StatusCode.OK).json({
        success: true,
        message: CartSuccessMessage.CART_DATA_CLEARED,
        data: clearedCart,
      })
    } catch (error) {
      console.error('clearCart error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: CartErrorMessage.FAILED_TO_CLEAR_CARTDATE,
      })
    }
  }
}
