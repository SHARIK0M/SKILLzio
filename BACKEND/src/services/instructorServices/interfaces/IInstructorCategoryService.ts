import { ICategoryModel } from "../../../models/category.Model";

export interface IInstructorCategoryService {
  fetchActiveCategories(): Promise<ICategoryModel[]>;
}
