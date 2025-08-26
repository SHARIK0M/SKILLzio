import { IPayment, PaymentModel } from "../../models/payment.Model";
import { GenericRepository } from "./generic.Repository"; 

export class PaymentRepository extends GenericRepository<IPayment> {
  constructor() {
    super(PaymentModel);
  }
}
