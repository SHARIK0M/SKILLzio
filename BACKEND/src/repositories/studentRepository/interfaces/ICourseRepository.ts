// interfaces/ICourseRepository.ts
import { IGenericRepository } from "../../genericRepo/generic.Repository"; 
import { ICourse } from "../../../models/course.Model"; 

export interface ICourseRepository extends IGenericRepository<ICourse> {}
