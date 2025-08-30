import { IInstructorSlotBookingService } from "./interfaces/IInstructorSlotBookingService";
import { IInstructorSlotBookingRepository } from "../../repositories/studentRepository/interfaces/IInstructorSlotBookingRepository"; 
import { Types } from "mongoose";
import createHttpError from "http-errors";
import { IBooking } from "../../models/booking.Model";

export class InstructorSlotBookingService implements IInstructorSlotBookingService {
  constructor(private bookingRepo: IInstructorSlotBookingRepository) {}

  async getBookingDetail(instructorId: Types.ObjectId, slotId: Types.ObjectId): Promise<IBooking> {
    const booking = await this.bookingRepo.getBookingDetail(slotId);
    if (!booking) throw createHttpError.NotFound("Booking not found");
    if (!booking.instructorId || !(booking.instructorId as any)._id.equals(instructorId)) {
      throw createHttpError.Forbidden("Access denied to booking detail");
    }

    return booking;
  }
}
