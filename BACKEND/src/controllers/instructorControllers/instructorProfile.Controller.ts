import { Request, Response } from 'express' // Importing types for request and response
import { IInstructorProfileService } from '../../services/instructorServices/interfaces/IInstructorProfileService' // Interface for instructor service
import { IInstructorProfileController } from './interfaces/IInstructorProfileController' // Interface for controller
import { JwtService } from '../../utils/jwt' // Utility class for JWT token handling
import { uploadToS3Bucket } from '../../utils/s3Bucket' // Utility to upload files to S3
import { getPresignedUrl } from '../../utils/getPresignedUrl' // Utility to get S3 presigned URL
import bcrypt from 'bcrypt' // Library to hash and compare passwords
import { StatusCode } from '../../utils/enums' // Enum for HTTP status codes
import { InstructorErrorMessages, InstructorSuccessMessages } from '../../utils/constants' // Constants for success and error messages

// Controller class implementing instructor profile operations
export class InstructorProfileController implements IInstructorProfileController {
  private service: IInstructorProfileService // Service instance for business logic
  private jwt = new JwtService() // JWT utility instance

  // Constructor receives the service instance
  constructor(service: IInstructorProfileService) {
    this.service = service
  }

  // Get the instructor profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies['accessToken'] // Extract token from cookies

      const decoded = await this.jwt.verifyToken(token) // Verify token and decode

      const instructor = await this.service.getProfile(decoded.email) // Fetch instructor profile by email

      // If instructor not found or not verified, return unauthorized
      if (!instructor || !instructor.isVerified) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: InstructorErrorMessages.UNAUTHORIZED,
        })
        return
      }

      // If profile picture exists, generate presigned URL
      const profilePicUrl = instructor.profilePicUrl
        ? await getPresignedUrl(instructor.profilePicUrl)
        : undefined

      // Return success response with instructor profile data
      res.status(StatusCode.OK).json({
        success: true,
        message: InstructorSuccessMessages.PROFILE_FETCHED,
        data: {
          ...instructor.toObject(), // Convert Mongoose document to plain object
          profilePicUrl,
        },
      })
    } catch (err) {
      // If token is invalid, return unauthorized
      res.status(StatusCode.UNAUTHORIZED).json({
        success: false,
        message: InstructorErrorMessages.TOKEN_INVALID,
      })
    }
  }

  // Update instructor profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies['accessToken'] // Extract token from cookies
      const decoded = await this.jwt.verifyToken(token) // Decode token
      const userId = decoded.id // Get instructor ID from token

      const { username, skills, expertise } = req.body // Extract profile data from request body

      let profilePicUrl
      if (req.file) {
        // If new profile picture uploaded, upload to S3
        profilePicUrl = await uploadToS3Bucket(req.file, 'instructors')
      }

      // Prepare update data object, only include fields that exist
      const updateData: any = {
        ...(username && { username }),
        ...(skills && { skills: JSON.parse(skills) }), // Parse JSON if passed as string
        ...(expertise && { expertise: JSON.parse(expertise) }),
        ...(profilePicUrl && { profilePicUrl }),
      }

      const updated = await this.service.updateProfile(userId, updateData) // Call service to update profile

      // If update fails, return bad request
      if (!updated) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: InstructorErrorMessages.PROFILE_UPDATE_FAILED,
        })
        return
      }

      // Return success response with updated profile
      res.status(StatusCode.OK).json({
        success: true,
        message: InstructorSuccessMessages.PROFILE_UPDATED,
        data: updated,
      })
    } catch (err) {
      // If error occurs, return internal server error
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: InstructorErrorMessages.INTERNAL_SERVER_ERROR,
      })
    }
  }

  // Update instructor password
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies['accessToken'] // Extract token from cookies
      const decoded = await this.jwt.verifyToken(token) // Decode token
      const email = decoded.email // Get instructor email
      const { currentPassword, newPassword } = req.body // Extract passwords from body
      const instructor = await this.service.getProfile(email) // Fetch instructor profile

      // If instructor not found, return not found
      if (!instructor) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: InstructorErrorMessages.INSTRUCTOR_NOT_FOUND,
        })
        return
      }

      // Compare current password with hashed password in DB
      const isMatch = await bcrypt.compare(currentPassword, instructor.password)

      // If password does not match, return unauthorized
      if (!isMatch) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: InstructorErrorMessages.CURRENT_PASSWORD_INCORRECT,
        })
        return
      }

      const hashed = await bcrypt.hash(newPassword, 10) // Hash new password
      const updated = await this.service.updatePassword(email, hashed) // Update password in DB

      // If update fails, return bad request
      if (!updated) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: InstructorErrorMessages.PASSWORD_UPDATE_FAILED,
        })
        return
      }

      // Return success response
      res.status(StatusCode.OK).json({
        success: true,
        message: InstructorSuccessMessages.PASSWORD_UPDATED,
      })
    } catch (err) {
      // If error occurs, return internal server error
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: InstructorErrorMessages.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
