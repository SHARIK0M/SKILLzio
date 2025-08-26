import { ICategoryModel } from "../../../models/category.Model"; 

export interface ICategoryReadOnlyService {
  getAllCategories(): Promise<ICategoryModel[]>;
}
