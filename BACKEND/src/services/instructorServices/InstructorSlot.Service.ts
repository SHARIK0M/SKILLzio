import { IInstructorSlotService } from './interfaces/IInstructorSlotService'
import { IInstructorSlotRepository } from '../../repositories/instructorRepository/interfaces/IInstructorSlotRepository'
import { ISlot } from '../../models/slot.Model'
import { Types } from 'mongoose'
import createHttpError from 'http-errors'

// Service class for managing instructor slots
export class InstructorSlotService implements IInstructorSlotService {
  constructor(private slotRepo: IInstructorSlotRepository) {}

  // Create a new slot for an instructor
  async createSlot(
    instructorId: Types.ObjectId,
    startTime: Date,
    endTime: Date,
    price: number,
  ): Promise<ISlot> {
    const now = new Date()

    // Prevent creating slots in the past
    if (startTime <= now) {
      throw createHttpError.BadRequest('Cannot create a slot in the past')
    }

    // Validate that end time is after start time
    if (endTime <= startTime) {
      throw createHttpError.BadRequest('End time must be after start time')
    }

    // Check if the new slot overlaps with existing slots
    const hasOverlap = await this.slotRepo.checkOverlap(instructorId, startTime, endTime)
    if (hasOverlap) {
      throw createHttpError.Conflict('Slot overlaps with an existing one')
    }

    // Create and save the new slot
    return await this.slotRepo.createSlot({
      instructorId,
      startTime,
      endTime,
      price,
      isBooked: false,
    })
  }

  // Update an existing slot of an instructor
  async updateSlot(
    instructorId: Types.ObjectId,
    slotId: Types.ObjectId,
    data: Partial<ISlot>,
  ): Promise<ISlot> {
    // Fetch slot by ID
    const slot = await this.slotRepo.getSlotById(slotId)
    if (!slot) throw createHttpError.NotFound('Slot not found')

    // Ensure the slot belongs to the instructor
    if (!slot.instructorId.equals(instructorId)) throw createHttpError.Forbidden('Access denied')

    const now = new Date()

    // If new times are given, use them, otherwise keep old values
    const newStartTime = data.startTime ? new Date(data.startTime) : slot.startTime
    const newEndTime = data.endTime ? new Date(data.endTime) : slot.endTime

    // Validate that updated start time is not in the past
    if (newStartTime <= now) {
      throw createHttpError.BadRequest('Cannot set slot in the past')
    }

    // Validate that updated end time is after start time
    if (newEndTime <= newStartTime) {
      throw createHttpError.BadRequest('End time must be after start time')
    }

    // Check overlap (excluding the current slot itself)
    const hasOverlap = await this.slotRepo.checkOverlap(
      instructorId,
      newStartTime,
      newEndTime,
      slot._id as Types.ObjectId,
    )

    // Only throw conflict if overlap exists AND the times have actually changed
    if (
      hasOverlap &&
      (newStartTime.getTime() !== slot.startTime.getTime() ||
        newEndTime.getTime() !== slot.endTime.getTime())
    ) {
      throw createHttpError.Conflict('Updated slot overlaps with an existing one')
    }

    // Update the slot with new data
    const updated = await this.slotRepo.updateSlot(slotId, {
      ...data,
      startTime: newStartTime,
      endTime: newEndTime,
    })

    if (!updated) throw createHttpError.InternalServerError('Update failed')
    return updated
  }

  // Delete a slot (only allowed for the instructor who owns it)
  async deleteSlot(instructorId: Types.ObjectId, slotId: Types.ObjectId): Promise<void> {
    const slot = await this.slotRepo.getSlotById(slotId)
    if (!slot) throw createHttpError.NotFound('Slot not found')

    if (!slot.instructorId.equals(instructorId)) throw createHttpError.Forbidden('Access denied')

    await this.slotRepo.deleteSlot(slotId)
  }

  // List all slots for a specific instructor
  async listSlots(instructorId: Types.ObjectId): Promise<ISlot[]> {
    return await this.slotRepo.getSlotsByInstructor(instructorId)
  }

  // Get statistical data about instructor slots
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
    return await this.slotRepo.getSlotStats(instructorId, mode, options)
  }
}
