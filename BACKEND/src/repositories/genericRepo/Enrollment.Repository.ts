import { IEnrollment, EnrollmentModel } from "../../models/enrollment.Model";
import { GenericRepository } from "./generic.Repository"; 

export class EnrollmentRepository extends GenericRepository<IEnrollment> {
  constructor() {
    super(EnrollmentModel);
  }
}
