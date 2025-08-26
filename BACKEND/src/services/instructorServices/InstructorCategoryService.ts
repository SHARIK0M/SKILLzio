import { IInstructorCategoryService } from "../instructorServices/interfaces/IInstructorCategoryService";
import { IInstructorCategoryRepository } from "../../repositories/instructorRepository/interfaces/IInstructorCategoryRepository";
import { ICategoryModel } from "../../models/category.Model";

export class InstructorCategoryService implements IInstructorCategoryService {
  private categoryRepo: IInstructorCategoryRepository;

  constructor(categoryRepo: IInstructorCategoryRepository) {
    this.categoryRepo = categoryRepo;
  }

  async fetchActiveCategories(): Promise<ICategoryModel[]> {
    return await this.categoryRepo.getListedCategories();
  }
}
