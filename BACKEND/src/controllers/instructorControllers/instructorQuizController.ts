import { Request, Response, NextFunction } from 'express'
import { IInstructorQuizController } from './interfaces/IInstructorQuizController'
import { IInstructorQuizService } from '../../services/instructorServices/interfaces/IInstructorQuizService'
import { StatusCode } from '../../types/enums'
import { QuizErrorMessages, QuizSuccessMessages } from '../../types/constants'

// Controller handling quiz operations for instructors
export class InstructorQuizController implements IInstructorQuizController {
  private quizService: IInstructorQuizService

  constructor(quizService: IInstructorQuizService) {
    this.quizService = quizService
  }

  // Create a new quiz for a course
  async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.body

      // Validate courseId
      if (!courseId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: QuizErrorMessages.COURSE_ID_REQUIRED,
        })
        return
      }

      // Check if a quiz already exists for this course
      const existing = await this.quizService.getQuizByCourseId(courseId)
      if (existing) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message: QuizErrorMessages.QUIZ_ALREAD_CREATED,
        })
        return
      }

      // Create the quiz
      const created = await this.quizService.createQuiz(req.body)

      res.status(StatusCode.CREATED).json({
        success: true,
        message: QuizSuccessMessages.QUIZ_CREATED,
        data: created,
      })
    } catch (err) {
      next(err)
    }
  }

  // Delete a quiz by ID
  async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params
      const deleted = await this.quizService.deleteQuiz(quizId)

      if (!deleted) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: QuizErrorMessages.QUIZ_OR_QUESTION_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: QuizSuccessMessages.QUIZ_DELETED,
      })
    } catch (err) {
      next(err)
    }
  }

  // Get a quiz by its ID
  async getQuizById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params
      const quiz = await this.quizService.getQuizById(quizId)

      if (!quiz) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: 'Quiz not found' })
        return
      }

      res.status(StatusCode.OK).json({ success: true, data: quiz })
    } catch (err) {
      next(err)
    }
  }

  // Get a quiz by course ID, returns questions
  async getQuizByCourseId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const quiz = await this.quizService.getQuizByCourseId(courseId) // returns IQuiz | null

      // If no quiz exists, return empty questions
      if (!quiz) {
        res.status(StatusCode.OK).json({
          success: true,
          message: 'No quiz found',
          data: { courseId, questions: [] },
        })
        return
      }

      // Map quiz questions and attach quizId
      const questions =
        quiz.questions?.map((q) => ({
          ...q.toObject?.(), // handle Mongoose subdocument
          quizId: quiz._id,
        })) || []

      res.status(StatusCode.OK).json({
        success: true,
        message: QuizSuccessMessages.QUIZ_FETCHED,
        data: { courseId, questions },
      })
    } catch (err) {
      next(err)
    }
  }

  // Add a new question to a quiz
  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params
      const added = await this.quizService.addQuestionToQuiz(courseId, req.body)

      res.status(StatusCode.CREATED).json({
        success: true,
        message: QuizSuccessMessages.QUESTION_ADDED,
        data: added,
      })
    } catch (err: any) {
      // Handle duplicate question errors
      if (err.message?.includes('already exists')) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message: err.message,
        })
      } else {
        next(err)
      }
    }
  }

  // Update an existing question in a quiz
  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, questionId } = req.params
      const updated = await this.quizService.updateQuestionInQuiz(quizId, questionId, req.body)

      if (!updated) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: QuizErrorMessages.QUIZ_OR_QUESTION_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: QuizSuccessMessages.QUESTION_UPDATED,
        data: updated,
      })
    } catch (err: any) {
      // Handle duplicate question errors
      if (err.message?.includes('already exists')) {
        res.status(StatusCode.CONFLICT).json({
          success: false,
          message: err.message,
        })
      } else {
        next(err)
      }
    }
  }

  // Delete a question from a quiz
  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, questionId } = req.params
      const deleted = await this.quizService.deleteQuestionFromQuiz(quizId, questionId)

      if (!deleted) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: QuizErrorMessages.QUIZ_OR_QUESTION_NOT_FOUND,
        })
        return
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: QuizSuccessMessages.QUESTION_DELETED,
        data: deleted,
      })
    } catch (err) {
      next(err)
    }
  }

  // Get paginated quiz questions for a course
  async getPaginatedQuestionsByCourseId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { courseId } = req.params
      const { page = '1', limit = '10', search = '' } = req.query

      const pageNum = Number(page)
      const limitNum = Number(limit)

      const { questions, total, quizId } = await this.quizService.getPaginatedQuestionsByCourseId(
        courseId,
        String(search),
        pageNum,
        limitNum,
      )

      res.status(StatusCode.OK).json({
        success: true,
        message: QuizSuccessMessages.QUIZ_FETCHED,
        data: {
          quizId,
          courseId,
          questions,
          total,
          page: pageNum,
          limit: limitNum,
        },
      })
    } catch (err) {
      next(err)
    }
  }
}
