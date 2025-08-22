import { ICategoryModel, CategoryModel } from '../../models/category.Model'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { IAdminCategoryRepository } from './interfaces/IAdminCategoryRepository'
import { CategoryErrorMsg } from '../../types/constants'

// AdminCategoryRepository extends the GenericRepository to reuse common CRUD logic
// and implements IAdminCategoryRepository to enforce category-specific methods
export class AdminCategoryRepository
  extends GenericRepository<ICategoryModel>
  implements IAdminCategoryRepository
{
  constructor() {
    // Pass the CategoryModel to GenericRepository so it knows which collection to use
    super(CategoryModel)
  }

  // Fetch all categories with pagination and optional search
  async getAllCategoriesPaginated(
    page: number,
    limit: number,
    search: string = '',
  ): Promise<{ data: ICategoryModel[]; total: number }> {
    try {
      // If search is provided, use a case-insensitive regex on categoryName
      const filter = search ? { categoryName: { $regex: new RegExp(search, 'i') } } : {}

      // Use the generic paginate method to fetch results
      // Sort categories by createdAt in descending order
      return await this.paginate(filter, page, limit, { createdAt: -1 })
    } catch (error) {
      // Propagate error to service/controller layer
      throw error
    }
  }

  // Find a category by its name (case-insensitive, exact match)
  async findCategoryByName(categoryName: string): Promise<ICategoryModel | null> {
    return this.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, 'i') },
    })
  }

  // Toggle (list/unlist) a category by its id
  async listOrUnlistCategory(id: string): Promise<ICategoryModel | null> {
    // First check if category exists
    const category = await this.findById(id)
    if (!category) {
      throw new Error(CategoryErrorMsg.CATEGORY_NOT_FOUND)
    }

    // Flip the isListed property (true -> false, false -> true)
    return this.update(id, { isListed: !category.isListed })
  }
}
