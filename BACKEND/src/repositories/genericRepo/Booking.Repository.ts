import { GenericRepository } from "./generic.Repository"; 
import { BookingModel,IBooking } from "../../models/booking.Model";


export class BookingRepository extends GenericRepository<IBooking>{
    constructor(){
        super(BookingModel)
    }
}