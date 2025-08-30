import { IInstructorSlotRepository } from './interfaces/IInstructorSlotRepository'
import SlotModel, { ISlot } from '../../models/slot.Model'
import { Types } from 'mongoose'
import { GenericRepository } from '../genericRepo/generic.Repository'

// Repository class for managing instructor slots
export class InstructorSlotRepository
  extends GenericRepository<ISlot>
  implements IInstructorSlotRepository
{
  constructor() {
    // Initialize repository with SlotModel
    super(SlotModel)
  }

  // Create a new slot for an instructor
  async createSlot(data: Partial<ISlot>): Promise<ISlot> {
    return await this.create(data)
  }

  // Update an existing slot by its ID
  async updateSlot(slotId: Types.ObjectId, data: Partial<ISlot>): Promise<ISlot | null> {
    return await this.update(slotId.toString(), data) // use generic update by ID
  }

  // Delete a slot by its ID
  async deleteSlot(slotId: Types.ObjectId): Promise<void> {
    await this.delete(slotId.toString()) // use generic delete
  }

  // Get a single slot by its ID
  async getSlotById(slotId: Types.ObjectId): Promise<ISlot | null> {
    return await this.findById(slotId.toString()) // use generic findById
  }

  // Get all slots for a specific instructor, sorted by start time
  async getSlotsByInstructor(instructorId: Types.ObjectId): Promise<ISlot[]> {
    return await this.find({ instructorId }, undefined, { startTime: 1 }) // use generic find
  }

  // Check if a slot overlaps with existing slots for the instructor
  async checkOverlap(
    instructorId: Types.ObjectId,
    startTime: Date,
    endTime: Date,
    excludeSlotId?: Types.ObjectId, // optional parameter to exclude a specific slot
  ): Promise<boolean> {
    const filter: any = {
      instructorId,
      $or: [
        {
          startTime: { $lt: endTime }, // slot starts before new end time
          endTime: { $gt: startTime }, // slot ends after new start time
        },
      ],
    }

    if (excludeSlotId) {
      filter._id = { $ne: excludeSlotId } // exclude the current slot from check
    }

    const overlappingSlot = await this.findOne(filter)
    return !!overlappingSlot // return true if overlap exists
  }

  // Get statistics of slots (total and booked) for instructor based on mode
  async getSlotStats(
    instructorId: Types.ObjectId,
    mode: 'monthly' | 'yearly' | 'custom',
    options: {
      month?: number
      year?: number
      startDate?: Date
      endDate?: Date
    },
  ) {
    let startDate: Date
    let endDate: Date

    // Monthly mode: requires month and year
    if (mode === 'monthly') {
      if (!options.month || !options.year)
        throw new Error('Month and Year are required for monthly mode')
      startDate = new Date(options.year, options.month - 1, 1)
      endDate = new Date(options.year, options.month, 1)

      // Yearly mode: requires year
    } else if (mode === 'yearly') {
      if (!options.year) throw new Error('Year is required for yearly mode')
      startDate = new Date(options.year, 0, 1)
      endDate = new Date(options.year + 1, 0, 1)

      // Custom mode: requires custom start and end dates
    } else if (mode === 'custom') {
      if (!options.startDate || !options.endDate)
        throw new Error('Start and end date are required for custom mode')
      startDate = options.startDate
      endDate = options.endDate

      // Invalid mode case
    } else {
      throw new Error('Invalid mode')
    }

    // Aggregation pipeline to calculate stats
    const result = await this.aggregate([
      {
        $match: {
          instructorId,
          startTime: { $gte: startDate, $lt: endDate }, // filter by date range
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }, // group by date
          },
          totalSlots: { $sum: 1 }, // count all slots
          bookedSlots: {
            $sum: {
              $cond: [{ $eq: ['$isBooked', true] }, 1, 0], // count booked slots
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          totalSlots: 1,
          bookedSlots: 1,
        },
      },
      { $sort: { date: 1 } }, // sort by date ascending
    ])

    return result
  }
}
