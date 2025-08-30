import { ISlot } from "../models/slot.Model";
import { IBooking } from "../models/booking.Model";
import { IUser } from "../models/user.Model";
import { IInstructor } from "../models/instructor.Model"; 

 export type PopulatedBooking = IBooking & {
    slotId : ISlot,
    instructorId:IInstructor,
    studentId : IUser
}