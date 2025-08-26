import mongoose from 'mongoose'
import { QuizModel, IQuiz } from '../../models/quiz.Model'
import { IInstructorQuizRepository } from './interfaces/IInstructorQuizRepository'
import { GenericRepository } from '../genericRepo/generic.Repository'

// Repository for handling instructor quiz-related database operations
export class InstructorQuizRepository
  extends GenericRepository<IQuiz>
  implements IInstructorQuizRepository
{
  constructor() {
    super(QuizModel)
  }

  // Create a new quiz
  async createQuiz(data: Partial<IQuiz>): Promise<IQuiz> {
    return await this.create(data)
  }

  // Delete a quiz by its ID
  async deleteQuiz(id: string): Promise<IQuiz | null> {
    return await this.delete(id)
  }

  // Get a quiz by its ID
  async getQuizById(id: string): Promise<IQuiz | null> {
    return await this.findById(id)
  }

  // Get a quiz associated with a specific course
  async getQuizByCourseId(courseId: string): Promise<IQuiz | null> {
    return await this.findOne({ courseId: new mongoose.Types.ObjectId(courseId) })
  }

  // Add a new question to a course's quiz
  async addQuestionToQuiz(courseId: string, question: IQuiz['questions'][0]): Promise<IQuiz> {
    const quiz = await this.findOne({ courseId: new mongoose.Types.ObjectId(courseId) })
    if (!quiz) throw new Error('Quiz not found for this course')

    // Check for duplicate questions in the same quiz
    const isDuplicate = quiz.questions.some(
      (q) => q.questionText.trim().toLowerCase() === question.questionText.trim().toLowerCase(),
    )

    if (isDuplicate) {
      throw new Error('Question already exists in the quiz')
    }

    // Add the question and save the quiz
    quiz.questions.push(question)
    return await quiz.save()
  }

  // Update an existing question in a quiz
  async updateQuestionInQuiz(
    quizId: string,
    questionId: string,
    updatedData: Partial<IQuiz['questions'][0]>,
  ): Promise<IQuiz | null> {
    const quiz = await this.findById(quizId)
    if (!quiz) return null

    const currentQuestion = quiz.questions.id(questionId)
    if (!currentQuestion) return null

    // Check for duplicate question text in the same quiz (excluding the current question)
    const newText = updatedData.questionText?.trim().toLowerCase()
    if (newText) {
      const isDuplicate = quiz.questions.some((q) => {
        const question = q as (typeof quiz.questions)[0] & { _id: mongoose.Types.ObjectId }
        return (
          question._id.toString() !== questionId &&
          question.questionText.trim().toLowerCase() === newText
        )
      })

      if (isDuplicate) {
        throw new Error('Another question with the same text already exists')
      }
    }

    // Update the question and save
    currentQuestion.set(updatedData)
    return await quiz.save()
  }

  // Delete a specific question from a quiz
  async deleteQuestionFromQuiz(quizId: string, questionId: string): Promise<IQuiz | null> {
    const quiz = await this.findById(quizId)
    if (!quiz) return null

    // Remove the question by ID
    quiz.questions.pull({ _id: questionId })
    return await quiz.save()
  }

  // Get paginated and searchable questions for a specific course's quiz
  async getPaginatedQuestionsByCourseId(
    courseId: string,
    search: string,
    page: number,
    limit: number,
  ): Promise<{ questions: IQuiz['questions'][0][]; total: number; quizId: string | null }> {
    const quiz = await this.findOne({ courseId: new mongoose.Types.ObjectId(courseId) })
    if (!quiz) return { questions: [], total: 0, quizId: null }

    // Filter questions based on search text
    const filtered = quiz.questions.filter((q) =>
      q.questionText.toLowerCase().includes(search.toLowerCase()),
    )

    // Pagination logic
    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      questions: paginated,
      total,
      quizId: (quiz._id as mongoose.Types.ObjectId).toString(),
    }
  }
}
