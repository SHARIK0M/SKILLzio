import { IBooking } from "../../../models/booking.Model";
import { PopulateOptions } from "mongoose";

export interface IStudentSlotBookingRepository {
  createBooking(booking: Partial<IBooking>): Promise<IBooking>;
  updateBookingStatus(id: string, update: Partial<IBooking>): Promise<void>;
  findBookingById(
    id: string,
    populate?: PopulateOptions[]
  ): Promise<IBooking | null>;
  findOne(
    filter: object,
    populate?: PopulateOptions[]
  ): Promise<IBooking | null>; // ✅ Add this

  findAllBookingsByStudentPaginated(
    studentId: string,
    page: number,
    limit: number,
    populate?: PopulateOptions[]
  ): Promise<{ data: IBooking[]; total: number }>;
}
