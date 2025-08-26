import { ICategoryReadOnlyController } from './interfaces/ICategoryReadOnlyController'
import { ICategoryReadOnlyService } from '../../services/studentServices/interfaces/ICategoryReadOnlyService'
import { Request, Response } from 'express'

// Controller for read-only category operations (for students)
export class CategoryReadOnlyController implements ICategoryReadOnlyController {
  private categoryService: ICategoryReadOnlyService

  constructor(categoryService: ICategoryReadOnlyService) {
    this.categoryService = categoryService
  }

  // Fetch all categories without modification (read-only)
  async getAllCategories(_req: Request, res: Response): Promise<void> {
    try {
      // Call service to get all categories
      const categories = await this.categoryService.getAllCategories()

      // Return categories with success response
      res.status(200).json({ success: true, data: categories })
    } catch (error) {
      // Log error and return server error response
      console.error('Error fetching categories:', error)
      res.status(500).json({ success: false, message: 'Failed to fetch categories' })
    }
  }
}
