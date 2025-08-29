import { Types } from 'mongoose'
import { IStudentEnrollmentService } from './interfaces/IStudentEnrollmentService'
import { IStudentEnrollmentRepository } from '../../repositories/studentRepository/interfaces/IStudentEnrollmentRepository'
import { IEnrollment } from '../../models/enrollment.Model'

// Service class that handles business logic for student course enrollments
export class StudentEnrollmentService implements IStudentEnrollmentService {
  private enrollmentRepo: IStudentEnrollmentRepository

  // Constructor takes in the repository that interacts with the database
  constructor(enrollmentRepo: IStudentEnrollmentRepository) {
    this.enrollmentRepo = enrollmentRepo
  }

  // Get all courses in which a specific student is enrolled
  async getAllEnrolledCourses(userId: Types.ObjectId): Promise<IEnrollment[]> {
    return this.enrollmentRepo.getAllEnrolledCourses(userId)
  }

  // Get detailed enrollment information for a specific course of a student
  async getEnrollmentCourseWithDetails(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<IEnrollment | null> {
    return this.enrollmentRepo.getEnrollmentByCourseDetails(userId, courseId)
  }

  // Mark a chapter as completed for a student inside a specific course
  async completeChapter(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    chapterId: Types.ObjectId,
  ): Promise<IEnrollment | null> {
    return this.enrollmentRepo.markChapterCompleted(userId, courseId, chapterId)
  }

  // Submit quiz results for a student in a specific course
  async submitQuizResult(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    quizData: {
      quizId: Types.ObjectId
      correctAnswers: number
      totalQuestions: number
      scorePercentage: number
    },
  ): Promise<IEnrollment | null> {
    return this.enrollmentRepo.submitQuizResult(userId, courseId, quizData)
  }

  // Check if all chapters of a course are completed by the student
  async areAllChaptersCompleted(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<boolean> {
    return this.enrollmentRepo.areAllChaptersCompleted(userId, courseId)
  }
}
