import { Response } from 'express'
import { IStudentProfileService } from '../../services/studentServices/interfaces/IStudentProfileService'
import { IStudentProfileController } from './interfaces/IStudentProfileController'
import { uploadToS3Bucket } from '../../utils/s3Bucket'
import { StatusCode } from '../../types/enums'
import { StudentSuccessMessages, StudentErrorMessages } from '../../types/constants'
import { getPresignedUrl } from '../../utils/getPresignedUrl'
import bcrypt from 'bcrypt'
import { AuthenticatedRequest } from '../../middlewares/AuthenticatedRoutes'

export class StudentProfileController implements IStudentProfileController {
  private studentProfileService: IStudentProfileService

  constructor(studentProfileService: IStudentProfileService) {
    this.studentProfileService = studentProfileService
  }

  // ✅ GET PROFILE
  public async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Get email from logged-in user
      const email = req.user?.email

      // 2. If no email found → token invalid
      if (!email) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: StudentErrorMessages.TOKEN_INVALID,
        })
        return
      }

      // 3. Fetch student profile from DB
      const student = await this.studentProfileService.getProfile(email)

      // 4. If no student found → return error
      if (!student) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: StudentErrorMessages.STUDENT_NOT_FOUND,
        })
        return
      }

      // 5. Generate a temporary (signed) URL for profile pic if available
      const profilePicUrl = student.profilePicUrl
        ? await getPresignedUrl(student.profilePicUrl)
        : undefined

      // 6. Send profile data as response
      res.status(StatusCode.OK).json({
        success: true,
        message: StudentSuccessMessages.PROFILE_FETCHED,
        data: {
          ...student.toObject(),
          profilePicUrl,
        },
      })
    } catch (error) {
      console.error('getProfile error:', error)
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: StudentErrorMessages.TOKEN_INVALID,
      })
    }
  }

  // ✅ UPDATE PROFILE
  public async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Get user id from token
      const userId = req.user?.id

      // 2. If no userId → invalid token
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: StudentErrorMessages.TOKEN_INVALID,
        })
        return
      }

      // 3. Extract fields from request body
      const { username, skills, expertise, currentStatus } = req.body

      // 4. If profile pic uploaded → save in S3
      let profilePicUrl
      if (req.file) {
        profilePicUrl = await uploadToS3Bucket(req.file, 'students')
      }

      // 5. Convert skills/expertise from JSON string to array
      const parsedSkills = skills ? JSON.parse(skills) : []
      const parsedExpertise = expertise ? JSON.parse(expertise) : []

      // 6. Prepare update object with only provided fields
      const updateData: any = {
        ...(username && { username }),
        ...(parsedSkills && { skills: parsedSkills }),
        ...(parsedExpertise && { expertise: parsedExpertise }),
        ...(currentStatus && { currentStatus }),
        ...(profilePicUrl && { profilePicUrl }),
      }

      // 7. Update student profile in DB
      const updatedStudent = await this.studentProfileService.updateProfile(userId, updateData)

      // 8. If update failed → return error
      if (!updatedStudent) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: StudentErrorMessages.PROFILE_UPDATE_FAILED,
        })
        return
      }

      // 9. Send success response with updated data
      res.status(StatusCode.OK).json({
        success: true,
        message: StudentSuccessMessages.PROFILE_UPDATED,
        data: updatedStudent,
      })
    } catch (error) {
      console.error('updateProfile error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: StudentErrorMessages.INTERNAL_ERROR,
      })
    }
  }

  // ✅ UPDATE PASSWORD
  public async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // 1. Get email from logged-in user
      const email = req.user?.email

      // 2. If no email → invalid token
      if (!email) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: StudentErrorMessages.TOKEN_INVALID,
        })
        return
      }

      // 3. Get current & new passwords from request
      const { currentPassword, newPassword } = req.body

      // 4. Find student using email
      const student = await this.studentProfileService.getProfile(email)

      // 5. If student not found → return error
      if (!student) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: StudentErrorMessages.STUDENT_NOT_FOUND,
        })
        return
      }

      // 6. Check if current password matches DB password
      const isMatch = await bcrypt.compare(currentPassword, student.password)
      if (!isMatch) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: StudentErrorMessages.CURRENT_PASSWORD_INCORRECT,
        })
        return
      }

      // 7. Encrypt new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // 8. Update password in DB
      const isUpdated = await this.studentProfileService.updatePassword(email, hashedPassword)

      // 9. If update failed → return error
      if (!isUpdated) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: StudentErrorMessages.PASSWORD_UPDATE_FAILED,
        })
        return
      }

      // 10. Success response
      res.status(StatusCode.OK).json({
        success: true,
        message: StudentSuccessMessages.PASSWORD_UPDATED,
      })
    } catch (error) {
      console.error('updatePassword error:', error)
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: StudentErrorMessages.INTERNAL_ERROR,
      })
    }
  }
}
