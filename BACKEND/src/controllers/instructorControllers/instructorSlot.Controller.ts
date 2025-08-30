import { IInstructorSlotController } from './interfaces/IInstructorSlotController'
import { IInstructorSlotService } from '../../services/instructorServices/interfaces/IInstructorSlotService'
import { Response } from 'express'
import mongoose from 'mongoose'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'
import { StatusCode } from '../../types/enums'

// Controller class to handle instructor slot-related operations
export class InstructorSlotController implements IInstructorSlotController {
  constructor(private slotService: IInstructorSlotService) {}

  // Create a new slot for the instructor
  async createSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Extract instructor ID from the authenticated user
      const instructorId = new mongoose.Types.ObjectId(req.user?.id)
      const { startTime, endTime, price } = req.body

      // Call service to create a slot with the given details
      const slot = await this.slotService.createSlot(
        instructorId,
        new Date(startTime),
        new Date(endTime),
        price,
      )

      // Send success response
      res.status(StatusCode.CREATED).json({ success: true, slot })
    } catch (error: any) {
      // Handle errors and send failure response
      res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to create slot',
      })
    }
  }

  // Update an existing slot by slotId
  async updateSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = new mongoose.Types.ObjectId(req.user?.id)
      const slotId = new mongoose.Types.ObjectId(req.params.slotId)

      // Call service to update slot with request body data
      const updated = await this.slotService.updateSlot(instructorId, slotId, req.body)

      res.status(StatusCode.OK).json({ success: true, slot: updated })
    } catch (error: any) {
      res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to update slot',
      })
    }
  }

  // Delete a specific slot
  async deleteSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = new mongoose.Types.ObjectId(req.user?.id)
      const slotId = new mongoose.Types.ObjectId(req.params.slotId)

      // Call service to delete slot
      await this.slotService.deleteSlot(instructorId, slotId)

      // Send no content response (successful deletion)
      res.status(StatusCode.NO_CONTENT).send()
    } catch (error: any) {
      res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to delete slot',
      })
    }
  }

  // List all slots of the instructor
  async listSlots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = new mongoose.Types.ObjectId(req.user?.id)

      // Fetch all slots for the instructor
      const slots = await this.slotService.listSlots(instructorId)

      res.status(StatusCode.OK).json({ success: true, slots })
    } catch (error: any) {
      res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch slots',
      })
    }
  }

  // Get slot statistics based on time filters (monthly, yearly, or custom date range)
  async getSlotStatsByMonth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instructorId = new mongoose.Types.ObjectId(req.user?.id)
      const mode = req.query.mode as 'monthly' | 'yearly' | 'custom'

      const options: any = {}

      // Mode: Monthly statistics
      if (mode === 'monthly') {
        const month = Number(req.query.month)
        const year = Number(req.query.year)
        if (!month || !year) throw new Error('Month and year are required')
        options.month = month
        options.year = year
      }
      // Mode: Yearly statistics
      else if (mode === 'yearly') {
        const year = Number(req.query.year)
        if (!year) throw new Error('Year is required')
        options.year = year
      }
      // Mode: Custom date range statistics
      else if (mode === 'custom') {
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null
        if (!startDate || !endDate) throw new Error('Start and end date are required')
        options.startDate = startDate
        options.endDate = endDate
      }
      // Invalid mode handling
      else {
        throw new Error('Invalid mode')
      }

      // Get slot statistics from the service
      const stats = await this.slotService.getSlotStats(instructorId, mode, options)

      res.status(StatusCode.OK).json({ success: true, data: stats })
    } catch (error: any) {
      res.status(error.status || StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch slot stats',
      })
    }
  }
}
