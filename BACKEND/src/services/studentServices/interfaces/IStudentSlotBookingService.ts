import { IBooking } from "../../../models/booking.Model"; 
import { ISlot } from "../../../models/slot.Model"; 
import { IInstructor } from "../../../models/instructor.Model";

export interface IStudentSlotBookingService {
  initiateCheckout(
    slotId: string,
    studentId: string
  ): Promise<{
    booking: {
      slotId: ISlot;
      instructorId: IInstructor;
    };
    razorpayOrder: any;
  }>;

  verifyPayment(
    slotId: string,
    studentId: string,
    razorpayPaymentId: string
  ): Promise<IBooking>;

  bookViaWallet(slotId: string, studentId: string): Promise<IBooking>;

  getStudentBookingHistoryPaginated(
  studentId: string,
  page: number,
  limit: number
): Promise<{ data: IBooking[]; total: number }>;


  getStudentBookingById(bookingId: string): Promise<IBooking | null>;
}
