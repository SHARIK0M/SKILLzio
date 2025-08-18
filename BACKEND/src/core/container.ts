/**
 * Dependency Injection Container
 * This file sets up and configures all application dependencies using dependency injection pattern.
 * It creates instances of repositories, services, and controllers in the correct order.
 */

// =============================================================================
// STUDENT MODULE IMPORTS
// =============================================================================
import { IStudentRepository } from '../repositories/studentRepository/interfaces/IStudentRepository'
import { StudentRepository } from '../repositories/studentRepository/studentRepository'
import IStudentService from '../services/studentServices/interfaces/IStudentService'
import { StudentServices } from '../services/studentServices/Student.Service'
import IStudentController from '../controllers/studentControllers/interfaces/IStudentController'
import { StudentController } from '../controllers/studentControllers/student.Controller'

// =============================================================================
// OTP MODULE IMPORTS
// =============================================================================
import IOtpRepository from '../repositories/otpRepository/interfaces/IOtpRepository'
import { OtpRepository } from '../repositories/otpRepository/OtpRepository'
import IOtpServices from '../services/instructorServices/interfaces/IOtpService'
import { OtpService } from '../services/OtpService/otp.Service'

// =============================================================================
// INSTRUCTOR MODULE IMPORTS
// =============================================================================
import IInstructorController from '../controllers/instructorControllers/interfaces/IInstructorController'
import { InstructorController } from '../controllers/instructorControllers/Instructor.Controller'
import IInstructorRepository from '../repositories/instructorRepository/interfaces/IInstructorRepository'
import InstructorRepository from '../repositories/instructorRepository/instructorRepository'
import IInstructorService from '../services/instructorServices/interfaces/IInstructorService'
import InstructorService from '../services/instructorServices/Instructor.Service'

// =============================================================================
// ADMIN MODULE IMPORTS
// =============================================================================
import { IAdminRepository } from '../repositories/adminRepository/interfaces/IAdminRepository'
import { AdminRespository } from '../repositories/adminRepository/admin.Repository'
import { IAdminUserRepository } from '../repositories/adminRepository/interfaces/IAdminUserRepository'
import { AdminUserRepository } from '../repositories/adminRepository/adminUser.Repository'
import { IAdminInstructorRepository } from '../repositories/adminRepository/interfaces/IAdminInstructorRepository'
import { AdminInstructorRepository } from '../repositories/adminRepository/adminInstructor.Repository'
import { IAdminService } from '../services/adminServices/interfaces/IAdminService'
import { AdminService } from '../services/adminServices/admin.Service'
import { IAdminController } from '../controllers/adminControllers/interfaces/IAdminController'
import { AdminController } from '../controllers/adminControllers/admin.Controller'

// =============================================================================
// ADMIN VERIFICATION MODULE IMPORTS
// =============================================================================
import { IAdminVerificationRepository } from '../repositories/adminRepository/interfaces/IAdminVerificationRepository'
import { AdminVerificationRepository } from '../repositories/adminRepository/adminVerification.Repository'
import { IAdminVerificationService } from '../services/adminServices/interfaces/IAdminVerificationService'
import { AdminVerificationService } from '../services/adminServices/AdminVerification.Service'
import IAdminVerificationController from '../controllers/adminControllers/interfaces/IAdminVerificationController'
import { AdminVerificationController } from '../controllers/adminControllers/adminVerification.Controller'

// =============================================================================
// INSTRUCTOR VERIFICATION MODULE IMPORTS
// =============================================================================
import { IInstructorVerificationRepository } from '../repositories/instructorRepository/interfaces/IInstructorVerifcationRepository'
import { InstructorVerificationRepository } from '../repositories/instructorRepository/instructorVerificationRepository'
import { IInstructorVerificationService } from '../services/instructorServices/interfaces/IInstructorVerificationService'
import { InstructorVerificationService } from '../services/instructorServices/InstructorVerification.Service'
import IInstructorVerificationController from '../controllers/instructorControllers/interfaces/IInstructorVerificationController'
import { InstructorVerificationController } from '../controllers/instructorControllers/instructorVerification.Controller'

// =============================================================================
// DEPENDENCY INJECTION SETUP
// =============================================================================

/**
 * Step 1: Create Base Dependencies
 * These are foundational services that other modules depend on
 */

// OTP Service - Used by student and instructor authentication
const otpRepository: IOtpRepository = new OtpRepository()
const otpService: IOtpServices = new OtpService(otpRepository)

/**
 * Step 2: Create Student Module Dependencies
 * Repository -> Service -> Controller (with OTP dependency)
 */
const studentRepository: IStudentRepository = new StudentRepository()
const studentService: IStudentService = new StudentServices(studentRepository)
const studentController: IStudentController = new StudentController(studentService, otpService)

/**
 * Step 3: Create Instructor Module Dependencies
 * Repository -> Service -> Controller (with OTP dependency)
 */
const instructorRepository: IInstructorRepository = new InstructorRepository()
const instructorService: IInstructorService = new InstructorService(instructorRepository)
const instructorController: IInstructorController = new InstructorController(
  instructorService,
  otpService,
)

/**
 * Step 4: Create Admin Module Dependencies
 * Multiple repositories -> Combined repository -> Service -> Controller
 */
const adminUserRepository: IAdminUserRepository = new AdminUserRepository()
const adminInstructorRepository: IAdminInstructorRepository = new AdminInstructorRepository()
const adminRepository: IAdminRepository = new AdminRespository(
  adminUserRepository,
  adminInstructorRepository,
)
const adminService: IAdminService = new AdminService(adminRepository)
const adminController: IAdminController = new AdminController(adminService)

/**
 * Step 5: Create Admin Verification Module
 * Handles verification processes for admin operations
 * Depends on instructor service for verification logic
 */
const adminVerificationRepository: IAdminVerificationRepository = new AdminVerificationRepository()
const adminVerificationService: IAdminVerificationService = new AdminVerificationService(
  adminVerificationRepository,
  instructorService, // Reusing instructor service for verification logic
)
const adminVerificationController: IAdminVerificationController = new AdminVerificationController(
  adminVerificationService,
)

/**
 * Step 6: Create Instructor Verification Module
 * Handles verification processes for instructor operations
 */
const instructorVerificationRepository: IInstructorVerificationRepository =
  new InstructorVerificationRepository()
const instructorVerificationService: IInstructorVerificationService =
  new InstructorVerificationService(instructorVerificationRepository)
const instructorVerificationController: IInstructorVerificationController =
  new InstructorVerificationController(instructorVerificationService)

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Export all controllers for use in route handlers
 * These controllers are the entry points for handling HTTP requests
 */
export {
  studentController, // Handles student-related operations
  instructorController, // Handles instructor-related operations
  adminController, // Handles admin-related operations
  adminVerificationController, // Handles admin verification processes
  instructorVerificationController, // Handles instructor verification processes
}