import { Request, Response } from 'express'
import { IAdminMembershipOrderController } from './interfaces/IAdminMembershipOrderController'
import { IAdminMembershipOrderService } from '../../services/adminServices/interfaces/IAdminMembershipOrderService'
import { StatusCode } from '../../types/enums'

// Controller for handling admin membership order related operations
export class AdminMembershipOrderController implements IAdminMembershipOrderController {
  // Inject the membership order service dependency through the constructor
  constructor(private readonly membershipOrderService: IAdminMembershipOrderService) {}

  // Get all membership orders with pagination support
  async getAllOrders(req: Request, res: Response): Promise<void> {
    // Extract page and limit from query params (with defaults)
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    // Fetch paginated orders and total count from service
    const { data, total } = await this.membershipOrderService.getAllOrders(page, limit)

    // Send response with orders and total count
    res.status(StatusCode.OK).json({ data, total })
  }

  // Get details of a specific membership order by transaction ID
  async getOrderDetail(req: Request, res: Response): Promise<void> {
    // Extract transaction ID from request params
    const { txnId } = req.params

    // Fetch order detail from service using txnId
    const order = await this.membershipOrderService.getOrderDetail(txnId)

    // Send response with order details
    res.status(StatusCode.OK).json({ data: order })
  }
}
