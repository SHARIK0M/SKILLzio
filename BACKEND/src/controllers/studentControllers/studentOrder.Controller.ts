import { Response } from 'express'
import { Types } from 'mongoose'
import { IStudentOrderController } from './interfaces/IStudentOrderController'
import { IStudentOrderService } from '../../services/studentServices/interfaces/IStudentOrderService'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { StatusCode } from '../../types/enums'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import { generateInvoicePdf } from '../../utils/generateInvoicePdf'

// Controller that handles student order-related requests
export class StudentOrderController implements IStudentOrderController {
  constructor(private orderService: IStudentOrderService) {}

  // Fetch paginated order history of a student
  async getOrderHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract student id from authenticated user
      const userId = new Types.ObjectId(req.user!.id)

      // Pagination setup (default: page=1, limit=5)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 5

      // Call service to fetch orders with pagination
      const { orders, total } = await this.orderService.getOrderHistoryPaginated(
        userId,
        page,
        limit,
      )

      console.log('orders', orders)

      // Return paginated orders
      res.status(StatusCode.OK).json({ success: true, orders, total })
    } catch (err) {
      console.error(err)

      // Handle failure
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch order history',
      })
    }
  }

  // Fetch detailed information of a single order
  async getOrderDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract orderId from params and userId from request
      const orderId = new Types.ObjectId(req.params.orderId)
      const userId = new Types.ObjectId(req.user!.id)

      // Call service to fetch order details
      const order = await this.orderService.getOrderDetails(orderId, userId)

      if (!order) {
        // If no order found
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Order not found',
        })
        return
      }

      // Add pre-signed S3 thumbnail URLs for each course
      const coursesWithSignedUrls = await Promise.all(
        order.courses.map(async (course: any) => {
          const signedUrl = await getPresignedUrl(course.thumbnailUrl)
          return {
            ...(course.toObject?.() || course), // keep original course object
            thumbnailUrl: signedUrl, // replace normal URL with signed one
          }
        }),
      )

      // Merge signed URLs back into order object
      const orderWithSignedUrls = {
        ...(order.toObject?.() || order),
        courses: coursesWithSignedUrls,
      }

      console.log(orderWithSignedUrls)

      // Return detailed order with signed thumbnail URLs
      res.status(StatusCode.OK).json({ success: true, order: orderWithSignedUrls })
    } catch (err) {
      console.error(err)

      // Handle failure
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch order details',
      })
    }
  }

  // Download invoice as PDF for a given order
  async downloadInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract orderId and userId
      const orderId = new Types.ObjectId(req.params.orderId)
      const userId = new Types.ObjectId(req.user!.id)

      // Get order details from service
      const order = await this.orderService.getOrderDetails(orderId, userId)

      if (!order) {
        // If order not found
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Order not found',
        })
        return
      }

      // Generate PDF invoice buffer for the order
      const pdfBuffer = await generateInvoicePdf(order)

      // Set headers for file download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${order._id}.pdf`,
      })

      // Send the generated PDF
      res.send(pdfBuffer)
    } catch (err) {
      console.error(err)

      // Handle failure
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to download invoice',
      })
    }
  }
}
