import { Types } from 'mongoose'
import { GenericRepository } from '../genericRepo/generic.Repository'
import { IStudentEnrollmentRepository } from './interfaces/IStudentEnrollmentRepository'
import { EnrollmentModel, IEnrollment } from '../../models/enrollment.Model'
import { generateCertificate } from '../../utils/certificateGenerator'
import { IStudentRepository } from './interfaces/IStudentRepository'
import IInstructorRepository from '../instructorRepository/interfaces/IInstructorRepository'

// Repository class for handling student enrollments
export class StudentEnrollmentRepository
  extends GenericRepository<IEnrollment>
  implements IStudentEnrollmentRepository
{
  private studentRepository: IStudentRepository
  private instructorRepository: IInstructorRepository

  constructor(studentRepository: IStudentRepository, instructorRepository: IInstructorRepository) {
    super(EnrollmentModel)
    this.studentRepository = studentRepository
    this.instructorRepository = instructorRepository
  }

  // Get all courses a student is enrolled in
  async getAllEnrolledCourses(userId: Types.ObjectId): Promise<IEnrollment[]> {
    const result = await this.findAll({ userId }, ['courseId'])
    return result || []
  }

  // Get details of a specific course enrollment (with chapters and quizzes)
  async getEnrollmentByCourseDetails(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<IEnrollment | null> {
    return this.findOne({ userId, courseId }, [
      {
        path: 'courseId',
        populate: [{ path: 'chapters' }, { path: 'quizzes' }],
      },
    ])
  }

  // Mark a chapter as completed for a student
  async markChapterCompleted(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    chapterId: Types.ObjectId,
  ): Promise<IEnrollment | null> {
    return this.findOneAndUpdate(
      {
        userId,
        courseId,
        'completedChapters.chapterId': { $ne: chapterId }, // Prevent duplicate entries
      },
      {
        $push: {
          completedChapters: {
            chapterId,
            isCompleted: true,
            completedAt: new Date(),
          },
        },
        $set: {
          completionStatus: 'IN_PROGRESS', // Set status when at least one chapter is completed
        },
      },
      { new: true },
    )
  }

  // Submit quiz result for a student in a course
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
    console.log('Submitting quiz result:', quizData)

    // Check if enrollment exists
    const enrollment = await this.findOne({ userId, courseId })
    if (!enrollment) {
      console.log('Enrollment not found during quiz submission')
      return null
    }

    // Check if quiz already exists in completedQuizzes
    const quizIndex = enrollment.completedQuizzes.findIndex(
      (q) => q.quizId.toString() === quizData.quizId.toString(),
    )

    const updatedQuiz = {
      ...quizData,
      attemptedAt: new Date(),
    }

    // Update existing quiz result or add a new one
    if (quizIndex !== -1) {
      enrollment.completedQuizzes[quizIndex] = updatedQuiz
    } else {
      enrollment.completedQuizzes.push(updatedQuiz)
    }

    await enrollment.save()

    // If score < 50%, do not generate certificate
    if (quizData.scorePercentage < 50) {
      console.log('Score is below 50%, certificate will not be generated.')
      return enrollment
    }

    // Fetch full enrollment with course and chapters
    const fullEnrollment = await this.findOne(
      { userId, courseId },
      {
        path: 'courseId',
        populate: { path: 'chapters' },
      },
    )

    if (!fullEnrollment || !fullEnrollment.courseId) {
      console.log('Full enrollment or course data is missing.')
      return enrollment
    }

    // Calculate if all chapters are completed
    const course: any = fullEnrollment.courseId
    const totalChapters = Array.isArray(course.chapters) ? course.chapters.length : 0
    const completedChaptersCount = fullEnrollment.completedChapters.length
    const allChaptersCompleted = totalChapters > 0 && completedChaptersCount === totalChapters

    if (!allChaptersCompleted) {
      console.log('Not all chapters are completed. Certificate will not be generated.')
      return enrollment
    }

    // Check if certificate already generated
    if (fullEnrollment.certificateGenerated) {
      console.log('Certificate already generated. Skipping generation.')
      return enrollment
    }

    // Fetch student info
    const student = await this.studentRepository.findById(userId)
    if (!student || !student.username) {
      console.log('Student or student username not found')
      return enrollment
    }

    // Fetch instructor info
    const instructor = await this.instructorRepository.findById(course.instructorId)
    const instructorName = instructor?.username || 'Course Instructor'

    console.log('All conditions met. Generating certificate...')

    // Generate certificate
    const certificateUrl = await generateCertificate({
      studentName: student.username,
      courseName: course.courseName,
      instructorName,
      userId: userId.toString(),
      courseId: courseId.toString(),
    })

    console.log('Certificate generated:', certificateUrl)

    // Update enrollment with certificate data
    await this.updateOne(
      { userId, courseId },
      {
        certificateGenerated: true,
        certificateUrl,
        completionStatus: 'COMPLETED',
      },
    )

    console.log('Enrollment updated with certificate data.')

    return await this.findOne({ userId, courseId })
  }

  // Check if all chapters are completed by a student
  async areAllChaptersCompleted(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<boolean> {
    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
    }).populate({
      path: 'courseId',
      populate: { path: 'chapters' },
    })

    if (!enrollment || !enrollment.courseId) return false

    const course: any = enrollment.courseId
    const totalChapters = course.chapters?.length || 0
    const completedCount = enrollment.completedChapters.length

    return totalChapters > 0 && completedCount === totalChapters
  }
}
