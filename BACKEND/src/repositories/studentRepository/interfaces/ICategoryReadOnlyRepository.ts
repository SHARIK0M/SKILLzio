import { ICategoryModel } from "../../../models/category.Model"; 

export interface ICategoryReadOnlyRepository {
  getAllCategories(): Promise<ICategoryModel[]>;
}
