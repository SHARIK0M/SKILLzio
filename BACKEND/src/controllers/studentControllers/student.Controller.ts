import { Request, Response } from 'express'
import IStudentController from './interfaces/IStudentController'
import IStudentServices from '../../services/studentServices/interfaces/IStudentService'
import IOtpServices from '../../services/instructorServices/interfaces/IOtpService'
import { OtpGenerate } from '../../utils/otpGenerator'
import { JwtService } from '../../utils/jwt'
import bcrypt from 'bcrypt'
import { StudentErrorMessages, StudentSuccessMessages } from '../../utils/constants'
import { Roles, StatusCode } from '../../utils/enums'
import { SendEmail } from '../../utils/sendOtpEmail'

/**
 * StudentController handles all student-related HTTP requests
 * Manages signup, login, OTP verification, password reset, and Google authentication
 */
export class StudentController implements IStudentController {
  // Service dependencies for database operations and utilities
  private studentService: IStudentServices
  private otpService: IOtpServices
  private otpGenerator: OtpGenerate
  private JWT: JwtService
  private emailSender: SendEmail

  /**
   * Constructor initializes all required services and utilities
   * @param studentService - Service for student database operations
   * @param otpService - Service for OTP management
   */
  constructor(studentService: IStudentServices, otpService: IOtpServices) {
    this.studentService = studentService
    this.otpService = otpService
    this.otpGenerator = new OtpGenerate()
    this.JWT = new JwtService()
    this.emailSender = new SendEmail()
  }

  /**
   * Handles student registration process
   * Steps: 1) Hash password, 2) Check if user exists, 3) Generate OTP, 4) Send verification email, 5) Create JWT token
   */
  async studentSignUp(req: Request, res: Response): Promise<any> {
    try {
      // Extract user registration data from request body
      let { email, password, username } = req.body

      // Hash the password for secure storage
      const saltRound = 10
      const hashedPassword = await bcrypt.hash(password, saltRound)
      password = hashedPassword

      // Check if a student with this email already exists
      const ExistingStudent = await this.studentService.findByEmail(email)

      if (ExistingStudent) {
        // Return error if user already exists
        return res.json({
          success: false,
          message: StudentErrorMessages.USER_ALREADY_EXISTS,
          user: ExistingStudent,
        })
      } else {
        // Generate a new OTP for email verification
        const otp = await this.otpGenerator.createOtpDigit()

        // Store the OTP in database for later verification
        await this.otpService.createOtp(email, otp)

        // Send verification email with OTP to the student
        await this.emailSender.sentEmailVerification('Student', email, otp)

        // Create a temporary JWT token containing user data for the verification process
        const token = await this.JWT.createToken({
          email,
          password,
          username,
          role: Roles.STUDENT,
        })

        // Return success response with token for next step
        return res.status(StatusCode.CREATED).json({
          success: true,
          message: StudentSuccessMessages.SIGNUP_SUCCESS,
          token,
        })
      }
    } catch (error: any) {
      // Handle any unexpected errors during signup
      console.error(error)
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
      })
    }
  }

  /**
   * Resends OTP verification email if the previous one wasn't received
   * Used when students need a new OTP during the signup process
   */
  async resendOtp(req: Request, res: Response): Promise<any> {
    try {
      // Get email from request body
      let { email } = req.body

      // Generate a fresh OTP
      const otp = await this.otpGenerator.createOtpDigit()

      // Replace the old OTP with the new one in database
      await this.otpService.createOtp(email, otp)

      // Send the new OTP via email
      await this.emailSender.sentEmailVerification('Student', email, otp)

      // Confirm OTP was sent successfully
      res.status(StatusCode.OK).json({
        success: true,
        message: StudentSuccessMessages.OTP_SENT,
      })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Completes user creation after OTP verification
   * Steps: 1) Verify JWT token, 2) Check OTP matches, 3) Create user in database
   */
  async createUser(req: Request, res: Response): Promise<any> {
    try {
      // Get OTP from request body
      const { otp } = req.body

      // Extract the verification token from request headers
      const token = req.headers['the-verify-token'] || ''
      if (typeof token != 'string') {
        throw new Error()
      }

      // Decode the JWT token to get user data
      const decode = await this.JWT.verifyToken(token)
      if (!decode) {
        return new Error(StudentErrorMessages.TOKEN_INVALID)
      }

      // Retrieve the stored OTP for this email
      const resultOtp = await this.otpService.findOtp(decode.email)
      console.log(resultOtp?.otp, '<>', otp)

      if (resultOtp?.otp === otp) {
        // OTP matches - create the user account in database
        const user = await this.studentService.createUser(decode)

        if (user) {
          // Clean up: delete the used OTP from database
          await this.otpService.deleteOtp(user.email)

          // Return success response with created user
          return res.status(StatusCode.CREATED).json({
            success: true,
            message: StudentSuccessMessages.USER_CREATED,
            user,
          })
        }
      } else {
        // OTP doesn't match - return error
        return res.json({
          success: false,
          message: StudentErrorMessages.INCORRECT_OTP,
        })
      }
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Handles student login authentication
   * Steps: 1) Find user by email, 2) Check if blocked, 3) Verify password, 4) Generate tokens
   */
  async login(req: Request, res: Response): Promise<any> {
    try {
      // Extract login credentials from request
      const { email, password } = req.body

      // Find student account by email
      const student = await this.studentService.findByEmail(email)

      if (!student) {
        // Return error if student account doesn't exist
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: StudentErrorMessages.INVALID_CREDENTIALS,
        })
      }

      // Check if the student account is blocked by admin
      if (student.isBlocked) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: 'Your login has been declined. Your account is blocked.',
        })
      }

      // Verify the provided password against stored hash
      const passwordMatch = await bcrypt.compare(password, student.password)

      if (!passwordMatch) {
        // Return error if password is incorrect
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: StudentErrorMessages.INVALID_CREDENTIALS,
        })
      }

      // Extract user info for token generation
      const role = student.role
      const id = student.id

      // Generate access and refresh tokens for session management
      const accessToken = await this.JWT.accessToken({ id, role, email })
      const refreshToken = await this.JWT.refreshToken({ id, role, email })

      console.log('ACCESS TOKEN:', accessToken)
      console.log('REFRESH TOKEN:', refreshToken)

      // Set tokens as HTTP-only cookies and return success response
      return res
        .status(StatusCode.OK)
        .cookie('accessToken', accessToken, { httpOnly: true })
        .cookie('refreshToken', refreshToken, { httpOnly: true })
        .send({
          success: true,
          message: 'User logged in successfully',
          user: student,
        })
    } catch (error) {
      throw error
    }
  }

  /**
   * Handles student logout by clearing authentication cookies
   */
  async logout(_req: Request, res: Response) {
    try {
      // Clear both authentication cookies to log out user
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')

      // Return success confirmation
      res
        .status(StatusCode.OK)
        .send({ success: true, message: StudentSuccessMessages.LOGOUT_SUCCESS })
    } catch (error) {
      throw error
    }
  }

  /**
   * Initiates password reset process by sending OTP to verified email
   * Used when students forget their password
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      // Get email address from request
      let { email } = req.body

      // Check if an account exists with this email
      const existingUser = await this.studentService.findByEmail(email)

      if (existingUser) {
        // Generate OTP for password reset verification
        const otp = await this.otpGenerator.createOtpDigit()

        // Store the OTP in database
        await this.otpService.createOtp(email, otp)
        console.log('verifyEmail otp ')

        // Send OTP via email for verification
        await this.emailSender.sentEmailVerification('Student', email, otp)
        console.log('verifyEmail otp is sended')

        // Return success response to redirect to OTP verification page
        res.send({
          success: true,
          message: StudentSuccessMessages.REDIERCTING_OTP_PAGE,
          data: existingUser,
        })
      } else {
        // Return error if no account found with this email
        res.send({
          success: false,
          message: StudentErrorMessages.USER_NOT_FOUND,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verifies the OTP entered during password reset process
   * Creates a temporary token for password reset if OTP is correct
   */
  async verifyResetOtp(req: Request, res: Response): Promise<void> {
    try {
      // Get email and OTP from request
      const { email, otp } = req.body

      // Retrieve the stored OTP for this email
      const resultOtp = await this.otpService.findOtp(email)

      console.log(resultOtp?.otp, '==', otp)

      if (resultOtp?.otp === otp) {
        // OTP is correct - create a temporary token for password reset
        let token = await this.JWT.createToken({ email })

        // Set the forgot password token as cookie and redirect to password reset page
        res.status(StatusCode.OK).cookie('forgotToken', token).json({
          success: true,
          message: StudentSuccessMessages.REDIERCTING_PASSWORD_RESET_PAGE,
        })
      } else {
        // OTP is incorrect - return error
        res.json({
          success: false,
          message: StudentErrorMessages.INCORRECT_OTP,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Resends OTP during the forgot password flow
   * Used when students don't receive the password reset OTP
   */
  async forgotResendOtp(req: Request, res: Response): Promise<void> {
    try {
      // Get email from request
      let { email } = req.body

      // Generate a new OTP for password reset
      let otp = await this.otpGenerator.createOtpDigit()

      // Replace old OTP with new one in database
      await this.otpService.createOtp(email, otp)

      console.log('forgotResendOtp controller in student')

      // Send the new OTP via email
      await this.emailSender.sentEmailVerification('student', email, otp)

      console.log('forgotResendOtp controller in student otp sended')

      // Confirm new OTP was sent
      res.status(StatusCode.OK).json({
        success: true,
        message: StudentSuccessMessages.OTP_SENT,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Completes the password reset process
   * Steps: 1) Verify reset token, 2) Hash new password, 3) Update password in database
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Get new password from request
      const { password } = req.body

      // Hash the new password for secure storage
      const hashedPassword = await bcrypt.hash(password, 10)

      // Get the forgot password token from cookies
      const token = req.cookies.forgotToken

      // Verify the reset token and extract email
      let data = await this.JWT.verifyToken(token)
      if (!data) {
        throw new Error(StudentErrorMessages.TOKEN_INVALID)
      }

      // Update the password in database
      const passwordReset = await this.studentService.resetPassword(data.email, hashedPassword)

      if (passwordReset) {
        // Clear the temporary reset token and return success
        res.clearCookie('forgotToken')
        res.status(StatusCode.OK).json({
          success: true,
          message: StudentSuccessMessages.PASSWORD_RESET,
        })
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Handles Google OAuth login for students
   * Creates new account if doesn't exist, or logs in existing user
   */
  async doGoogleLogin(req: Request, res: Response): Promise<void> {
    try {
      // Extract Google user data from request
      const { name, email } = req.body

      // Check if student account already exists
      const existingUser = await this.studentService.findByEmail(email)

      if (!existingUser) {
        // Create new student account using Google data
        const user = await this.studentService.googleLogin(name, email)

        if (user) {
          // Generate authentication tokens for the new user
          const role = user.role
          const accessToken = await this.JWT.accessToken({ id: user._id, email, role })
          const refreshToken = await this.JWT.refreshToken({ id: user._id, email, role })

          // Set tokens as cookies and return success response
          res
            .status(StatusCode.OK)
            .cookie('accessToken', accessToken, { httpOnly: true })
            .cookie('refreshToken', refreshToken, { httpOnly: true })
            .json({
              success: true,
              message: StudentSuccessMessages.GOOGLE_LOGIN_SUCCESS,
              user,
            })
        }
      } else {
        // User exists - check if account is blocked
        if (!existingUser.isBlocked) {
          // Account not blocked - proceed with login
          const role = existingUser.role
          const id = existingUser._id

          // Generate fresh authentication tokens
          const accessToken = await this.JWT.accessToken({ id, email, role })
          const refreshToken = await this.JWT.refreshToken({ id, email, role })

          // Set tokens and return success response
          res
            .status(StatusCode.OK)
            .cookie('accessToken', accessToken, { httpOnly: true })
            .cookie('refreshToken', refreshToken, { httpOnly: true })
            .json({
              success: true,
              message: StudentSuccessMessages.GOOGLE_LOGIN_SUCCESS,
              user: existingUser,
            })
        } else {
          // Account is blocked - deny login
          res.status(StatusCode.OK).json({
            success: false,
            message: StudentErrorMessages.INTERNAL_SERVER_ERROR,
            user: existingUser,
          })
        }
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Checks the current status of a student account (particularly if blocked)
   * Used to verify if user can continue using the application
   */
  async statusCheck(req: Request, res: Response): Promise<void> {
    try {
      // Extract access token from cookies
      const token = req.cookies.accessToken

      // Verify and decode the token to get user info
      const decoded = await this.JWT.verifyToken(token)

      if (!decoded?.email) {
        // Token is invalid or missing email
        res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: 'Invalid token' })
        return
      }

      // Find the student record using email from token
      const student = await this.studentService.findByEmail(decoded.email)

      if (!student) {
        // Student not found in database
        res.status(StatusCode.NOT_FOUND).json({ success: false, message: 'Student not found' })
        return
      }

      // Return the student's current status (mainly isBlocked flag)
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          isBlocked: student.isBlocked,
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
