import { Types } from "mongoose";
import { IBooking } from "../../../models/booking.Model";

export interface IInstructorSlotBookingService {
  getBookingDetail(instructorId: Types.ObjectId, slotId: Types.ObjectId): Promise<IBooking>;
}
