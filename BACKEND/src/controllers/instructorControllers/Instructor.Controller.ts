import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { OtpGenerate } from '../../utils/otpGenerator'
import { JwtService } from '../../utils/jwt'

import IInstructorController from './interfaces/IInstructorController'
import IInstructorService from '../../services/instructorServices/interfaces/IInstructorService'
import IOtpServices from '../../services/OtpService/interfaces/IOtpRepository'

import { InstructorErrorMessages, InstructorSuccessMessages } from '../../utils/constants'
import { Roles, StatusCode } from '../../utils/enums'
import { SendEmail } from '../../utils/sendOtpEmail'

/**
 * Controller class that handles all instructor-related HTTP requests
 * Implements authentication, registration, password reset, and Google login functionality
 */
export class InstructorController implements IInstructorController {
  // Service dependencies injected through constructor
  private instructorService: IInstructorService // Handles instructor database operations
  private otpService: IOtpServices // Manages OTP creation, verification, and deletion
  private otpGenerator: OtpGenerate // Generates random OTP codes
  private jwt: JwtService // Handles JWT token creation and verification
  private emailSender: SendEmail // Sends email notifications with OTPs

  /**
   * Constructor - initializes all service dependencies
   * @param instructorService - Service for instructor database operations
   * @param otpService - Service for OTP management
   */
  constructor(instructorService: IInstructorService, otpService: IOtpServices) {
    this.instructorService = instructorService
    this.otpService = otpService
    this.otpGenerator = new OtpGenerate()
    this.jwt = new JwtService()
    this.emailSender = new SendEmail()
  }

  /**
   * Handles instructor registration/signup process
   * Creates hashed password, checks for existing user, generates OTP, and sends verification email
   */
  public async signUp(req: Request, res: Response): Promise<void> {
    try {
      // Extract registration data from request body
      let { email, password, username } = req.body

      // Hash the password using bcrypt with salt rounds of 10
      const saltRound = 10
      const hashedPassword = await bcrypt.hash(password, saltRound)
      password = hashedPassword

      // Check if an instructor with this email already exists
      const ExistingInstructor = await this.instructorService.findByEmail(email)

      if (ExistingInstructor) {
        // Return error if user already exists
        res.json({
          success: false,
          message: InstructorErrorMessages.USER_ALREADY_EXISTS,
          user: ExistingInstructor,
        })
        return
      } else {
        // Generate OTP for email verification
        const otp = await this.otpGenerator.createOtpDigit()

        // Store OTP in database linked to email
        await this.otpService.createOtp(email, otp)

        // Send verification email with OTP
        await this.emailSender.sentEmailVerification('Instructor', email, otp)

        // Create JWT token containing user registration data
        const JWT = new JwtService()
        const token = await JWT.createToken({
          email,
          password,
          username,
          role: Roles.INSTRUCTOR,
        })

        // Return success response with token for next step verification
        res.status(StatusCode.CREATED).json({
          success: true,
          message: InstructorSuccessMessages.SIGNUP_SUCCESS,
          token,
        })
        return
      }
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Resends OTP to user's email address
   * Used when initial OTP expires or user doesn't receive it
   */
  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      // Extract email from request body
      let { email } = req.body

      // Generate new OTP
      const otp = await this.otpGenerator.createOtpDigit()

      // Store new OTP in database (replaces old one)
      await this.otpService.createOtp(email, otp)

      // Send new OTP via email
      await this.emailSender.sentEmailVerification('Instructor', email, otp)

      // Return success response
      res.status(StatusCode.OK).json({
        success: true,
        message: InstructorSuccessMessages.OTP_SENT,
      })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Completes user registration by verifying OTP
   * Validates OTP against stored value and creates instructor account in database
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Extract OTP from request body
      const { otp } = req.body
      console.log(req.body)

      // Get verification token from request headers
      const token = req.headers['the-verify-token'] || ''

      // Ensure token is a string
      if (typeof token != 'string') {
        throw new Error()
      }

      // Decode JWT token to get user registration data
      const decode = await this.jwt.verifyToken(token)

      // Validate token
      if (!decode) {
        throw new Error(InstructorErrorMessages.TOKEN_INVALID)
      }

      // Retrieve stored OTP for this email
      const resultOtp = await this.otpService.findOtp(decode.email)
      console.log(resultOtp)
      console.log(resultOtp?.otp, '<>', otp)

      // Verify OTP matches stored value
      if (resultOtp?.otp === otp) {
        // Create instructor account in database using decoded token data
        const user = await this.instructorService.createUser(decode)

        if (user) {
          // Clean up: delete used OTP from database
          await this.otpService.deleteOtp(user.email)

          // Return success response with created user
          res.status(StatusCode.CREATED).json({
            success: true,
            message: InstructorSuccessMessages.USER_CREATED,
            user,
          })
          return
        }
      } else {
        // Return error if OTP doesn't match
        res.json({
          success: false,
          message: InstructorErrorMessages.INCORRECT_OTP,
        })
        return
      }
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Handles instructor login authentication
   * Validates credentials, checks account status, and issues JWT tokens
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Extract login credentials from request body
      const { email, password } = req.body

      // Find instructor by email in database
      const instructor = await this.instructorService.findByEmail(email)

      // Return error if instructor doesn't exist
      if (!instructor) {
        res.json({
          success: false,
          message: InstructorErrorMessages.USER_NOT_FOUND,
        })
        return
      }

      // Compare provided password with stored hashed password
      const isPasswordValid = await bcrypt.compare(password, instructor.password)

      // Return error if password is incorrect
      if (!isPasswordValid) {
        res.json({
          success: false,
          message: InstructorErrorMessages.INVALID_CREDENTIALS,
        })
        return
      }

      // Check if instructor account is blocked
      if (instructor.isBlocked) {
        res.json({
          success: false,
          message: InstructorErrorMessages.INSTRUCTOR_BLOCKED,
        })
        return
      }

      // Extract user data for token creation
      let role = instructor.role
      let id = instructor._id

      // Generate access and refresh tokens
      const accesstoken = await this.jwt.accessToken({ email, role, id })
      const refreshToken = await this.jwt.refreshToken({ email, role, id })

      // Check if running in production environment for cookie settings
      const isProd = process.env.NODE_ENV === 'production'

      // Set secure HTTP-only cookies and return success response
      res
        .status(StatusCode.OK)
        .cookie('accessToken', accesstoken, {
          httpOnly: true, // Prevents client-side JavaScript access
          sameSite: isProd ? 'none' : 'lax', // CSRF protection
          secure: isProd, // HTTPS only in production
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: isProd ? 'none' : 'lax',
          secure: isProd,
        })
        .send({
          success: true,
          message: InstructorSuccessMessages.LOGIN_SUCCESS,
          user: instructor,
          token: { accesstoken, refreshToken },
        })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Handles instructor logout
   * Clears authentication cookies from client browser
   */
  async logout(_req: Request, res: Response) {
    try {
      // Clear authentication cookies
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')

      // Return success response
      res.status(StatusCode.OK).send({
        success: true,
        message: InstructorSuccessMessages.LOGOUT_SUCCESS,
      })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Initiates password reset process by sending OTP to verified email
   * First step in forgot password flow
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      // Extract email from request body
      let { email } = req.body

      // Check if instructor with this email exists
      let existingUser = await this.instructorService.findByEmail(email)

      if (existingUser) {
        // Generate OTP for password reset
        const otp = await this.otpGenerator.createOtpDigit()

        // Store OTP in database
        await this.otpService.createOtp(email, otp)

        // Send OTP via email
        await this.emailSender.sentEmailVerification('instructor', email, otp)

        // Return success - redirect to OTP verification page
        res.send({
          success: true,
          message: InstructorSuccessMessages.REDIERCTING_OTP_PAGE,
          data: existingUser,
        })
      } else {
        // Return error if email not found
        res.send({
          success: false,
          message: InstructorErrorMessages.USER_NOT_FOUND,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verifies OTP for password reset and issues temporary token
   * Second step in forgot password flow
   */
  async verifyResetOtp(req: Request, res: Response): Promise<void> {
    try {
      // Extract email and OTP from request body
      const { email, otp } = req.body

      // Retrieve stored OTP for this email
      const resultOtp = await this.otpService.findOtp(email)
      console.log(resultOtp?.otp, '<>', otp)

      // Verify OTP matches stored value
      if (resultOtp?.otp == otp) {
        // Generate temporary token for password reset authorization
        let token = await this.jwt.createToken({ email })

        // Set temporary token as cookie and redirect to password reset
        res.status(StatusCode.OK).cookie('forgotToken', token).json({
          success: true,
          message: InstructorSuccessMessages.REDIERCTING_PASSWORD_RESET_PAGE,
        })
      } else {
        // Return error if OTP is incorrect
        res.json({
          success: false,
          message: InstructorErrorMessages.INCORRECT_OTP,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Resends OTP for forgot password flow
   * Used when user doesn't receive OTP during password reset
   */
  async forgotResendOtp(req: Request, res: Response): Promise<void> {
    try {
      // Extract email from request body
      let { email } = req.body

      // Generate new OTP
      const otp = await this.otpGenerator.createOtpDigit()

      // Store new OTP in database
      await this.otpService.createOtp(email, otp)

      // Send new OTP via email
      await this.emailSender.sentEmailVerification('instructor', email, otp)

      // Return success response
      res.status(StatusCode.OK).json({
        success: true,
        message: InstructorSuccessMessages.OTP_SENT,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Completes password reset process
   * Final step - updates password in database using temporary token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Extract new password from request body
      const { password } = req.body

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Get temporary authorization token from cookies
      const token = req.cookies.forgotToken

      // Verify and decode the temporary token
      let data = await this.jwt.verifyToken(token)

      // Validate token
      if (!data) {
        throw new Error(InstructorErrorMessages.TOKEN_INVALID)
      }

      // Update password in database using email from token
      const passwordReset = await this.instructorService.resetPassword(data.email, hashedPassword)

      if (passwordReset) {
        // Clean up: remove temporary token cookie
        res.clearCookie('forgotToken')

        // Return success response
        res.status(StatusCode.OK).json({
          success: true,
          message: InstructorSuccessMessages.PASSWORD_RESET,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Handles Google OAuth login for instructors
   * Creates new account or logs in existing user using Google credentials
   */
  async doGoogleLogin(req: Request, res: Response): Promise<void> {
    try {
      // Extract Google user data from request body
      const { name, email } = req.body

      // Check if instructor already exists with this Google email
      const existingInstructor = await this.instructorService.findByEmail(email)

      if (!existingInstructor) {
        // Create new instructor account using Google credentials
        const instructor = await this.instructorService.googleLogin(name, email)

        if (instructor) {
          // Extract user data for JWT tokens
          const role = instructor.role
          const id = instructor._id

          // Generate authentication tokens
          const accessToken = await this.jwt.accessToken({ email, id, role })
          const refreshToken = await this.jwt.refreshToken({ email, id, role })

          // Set authentication cookies and return success
          res
            .status(StatusCode.OK)
            .cookie('accessToken', accessToken, { httpOnly: true })
            .cookie('refreshToken', refreshToken, { httpOnly: true })
            .json({
              success: true,
              message: InstructorSuccessMessages.GOOGLE_LOGIN_SUCCESS,
              instructor: instructor,
            })
        }
      } else {
        // Login existing instructor if account is not blocked
        if (!existingInstructor.isBlocked) {
          // Extract user data for JWT tokens
          const role = existingInstructor.role
          const id = existingInstructor._id

          // Generate authentication tokens
          const accessToken = await this.jwt.accessToken({ email, id, role })
          const refreshToken = await this.jwt.refreshToken({ email, id, role })

          // Set authentication cookies and return success
          res
            .status(StatusCode.OK)
            .cookie('accessToken', accessToken, { httpOnly: true })
            .cookie('refreshToken', refreshToken, { httpOnly: true })
            .json({
              sucess: true, // Note: There's a typo here - "sucess" instead of "success"
              message: InstructorSuccessMessages.GOOGLE_LOGIN_SUCCESS,
              instructor: existingInstructor,
            })
        }
        // Note: No explicit handling for blocked existing users - they get no response
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Checks the current status of an instructor (mainly if they're blocked)
   * Used to verify if instructor can still access the system
   */
  async statusCheck(req: Request, res: Response): Promise<void> {
    try {
      // Get access token from cookies
      const token = req.cookies.accessToken

      // Decode and verify the access token
      const decoded = await this.jwt.verifyToken(token)

      // Validate token contains email
      if (!decoded?.email) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
        })
        return
      }

      // Find instructor in database using email from token
      const instructor = await this.instructorService.findByEmail(decoded.email)

      // Return error if instructor not found
      if (!instructor) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Instructor not found',
        })
        return
      }

      // Return instructor's current status (primarily blocking status)
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          isBlocked: instructor.isBlocked,
        },
      })
    } catch (err) {
      // Handle any errors during status check
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Status check failed',
      })
    }
  }
}
