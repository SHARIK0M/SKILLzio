import { ICategoryModel } from "../../../models/category.Model";

export interface IInstructorCategoryRepository {
  getListedCategories(): Promise<ICategoryModel[]>;
}
