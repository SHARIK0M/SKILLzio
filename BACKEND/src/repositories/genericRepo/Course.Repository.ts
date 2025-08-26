import { ICourse, CourseModel } from "../../models/course.Model";

import { GenericRepository } from "./generic.Repository"; 

export class CourseRepository extends GenericRepository<ICourse> {
  constructor() {
    super(CourseModel);
  }
}
