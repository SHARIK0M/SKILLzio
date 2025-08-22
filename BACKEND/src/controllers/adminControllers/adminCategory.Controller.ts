import { Request, Response } from 'express'
import { IAdminCategoryController } from './interfaces/IAdminCategoryController'
import { IAdminCategoryService } from '../../services/adminServices/interfaces/IAdminCategoryService'
import { CategoryErrorMsg, CategorySuccessMsg, GeneralServerErrorMsg } from '../../types/constants'
import { StatusCode } from '../../types/enums'
import { ICategoryModel } from '../../models/category.Model'

// Controller class responsible for handling category-related operations for Admin
export class AdminCategoryContoller implements IAdminCategoryController {
  private categoryService: IAdminCategoryService

  // Injecting category service using dependency injection
  constructor(categoryService: IAdminCategoryService) {
    this.categoryService = categoryService
  }

  // Method to add a new category
  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryName } = req.body // Extract category name from request body

      // Check if category with the same name already exists
      const existingCategory = await this.categoryService.findCategoryByName(categoryName)
      if (existingCategory) {
        res
          .status(StatusCode.CONFLICT)
          .send({ success: false, message: CategoryErrorMsg.CATEGORY_EXISTS })
        return
      }

      // Create new category if it doesn't exist
      const createdCategory = await this.categoryService.addCategory(categoryName)
      if (createdCategory) {
        res.status(StatusCode.CREATED).send({
          success: true,
          message: CategorySuccessMsg.CATEGORY_ADDED,
          data: createdCategory,
        })
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).send({
          success: false,
          message: CategoryErrorMsg.CATEGORY_NOT_CREATED,
        })
      }
    } catch (error) {
      // If any unexpected error occurs, throw it to be handled by error middleware
      throw error
    }
  }

  // Method to edit or update a category
  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryName, id } = req.body // Extract new name and category id

      // Check if another category with the same name exists (but different id)
      const existingCategory = (await this.categoryService.findCategoryByName(
        categoryName,
      )) as ICategoryModel | null
      if (existingCategory && existingCategory._id.toString() !== id) {
        res.status(StatusCode.CONFLICT).send({
          success: false,
          message: CategoryErrorMsg.CATEGORY_EXISTS,
        })
        return
      }

      // Update the category with new name
      const updatedCategory = await this.categoryService.updateCategory(id, categoryName)
      if (updatedCategory) {
        res.status(StatusCode.OK).send({
          success: true,
          message: CategorySuccessMsg.CATEGORY_UPDATED,
          data: updatedCategory,
        })
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).send({
          success: false,
          message: CategoryErrorMsg.CATEGORY_NOT_UPDATED,
        })
      }
    } catch (error) {
      console.error('Edit Category Error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: CategoryErrorMsg.CATEGORY_NOT_UPDATED,
      })
    }
  }

  // Method to get all categories with pagination and optional search
  async getAllCategory(req: Request, res: Response): Promise<void> {
    try {
      // Extract pagination and search query parameters
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ''

      // Fetch paginated categories and total count
      const { data, total } = await this.categoryService.getAllCategoriesPaginated(
        page,
        limit,
        search,
      )

      // Send response with pagination details
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Categories fetched successfully',
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Something went wrong while fetching categories',
      })
    }
  }

  // Method to toggle category listing status (list or unlist)
  async listOrUnlistCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params // Extract category id from params

      // Toggle category status using service
      const response = await this.categoryService.listOrUnlistCategory(id)
      if (!response) throw new Error(GeneralServerErrorMsg.INTERNAL_SERVER_ERROR)

      // Prepare response message based on status
      const message = response.isListed
        ? CategorySuccessMsg.CATEGORY_LISTED
        : CategorySuccessMsg.CATEGORY_UNLISTED

      res.status(StatusCode.OK).send({ success: true, message, data: response })
    } catch (error) {
      throw error
    }
  }

  // Method to fetch a category by its ID
  async findCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params // Extract categoryId from params

      // Fetch category by id
      const response = await this.categoryService.findCategoryById(categoryId)
      if (!response) throw new Error(GeneralServerErrorMsg.INTERNAL_SERVER_ERROR)

      res.status(StatusCode.OK).send({
        success: true,
        message: CategorySuccessMsg.CATEGORY_FETCHED,
        data: response,
      })
    } catch (error) {
      throw error
    }
  }
}
