import { ICategoryReadOnlyService } from "./interfaces/ICategoryReadOnlyService"; 
import { ICategoryReadOnlyRepository } from "../../repositories/studentRepository/interfaces/ICategoryReadOnlyRepository";
import { ICategoryModel } from "../../models/category.Model"; 

export class CategoryReadOnlyService implements ICategoryReadOnlyService {
  private categoryRepo: ICategoryReadOnlyRepository;

  constructor(categoryRepo: ICategoryReadOnlyRepository) {
    this.categoryRepo = categoryRepo;
  }

  async getAllCategories(): Promise<ICategoryModel[]> {
    return await this.categoryRepo.getAllCategories();
  }
}
