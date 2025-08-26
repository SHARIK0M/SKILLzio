import { IGenericRepository } from "../../genericRepo/generic.Repository"; 
import { IPayment } from "../../../models/payment.Model"; 

export interface IPaymentRepository extends IGenericRepository<IPayment> {}
