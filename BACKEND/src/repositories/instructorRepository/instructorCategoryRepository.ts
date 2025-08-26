import { CategoryModel, ICategoryModel } from "../../models/category.Model";
import { GenericRepository } from "../genericRepo/generic.Repository";
import { IInstructorCategoryRepository } from "../../repositories/instructorRepository/interfaces/IInstructorCategoryRepository";

export class InstructorCategoryRepository
  extends GenericRepository<ICategoryModel>
  implements IInstructorCategoryRepository
{
  constructor() {
    super(CategoryModel); 
  }

  async getListedCategories(): Promise<ICategoryModel[]> {
    return await CategoryModel.find({ isListed: true }).select("categoryName");
  }
}
