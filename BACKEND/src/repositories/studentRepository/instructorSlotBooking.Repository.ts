import { BookingModel, IBooking } from "../../models/booking.Model";
import { IInstructorSlotBookingRepository } from "./interfaces/IInstructorSlotBookingRepository"; 
import { Types } from "mongoose";

export class InstructorSlotBookingRepository implements IInstructorSlotBookingRepository {
  async getBookingDetail(slotId: Types.ObjectId): Promise<IBooking | null> {
    return await BookingModel.findOne({ slotId })
      .populate("studentId", "username email")
      .populate("instructorId", "username email")
      .populate("slotId");
  }
}
