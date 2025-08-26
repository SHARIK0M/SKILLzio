// interfaces/IEnrollmentRepository.ts
import { IGenericRepository } from "../../genericRepo/generic.Repository"; 
import { IEnrollment } from "../../../models/enrollment.Model"; 

export interface IEnrollmentRepository
  extends IGenericRepository<IEnrollment> {}
