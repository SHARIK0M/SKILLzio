/**
 * Dependency Injection Container
 * This file sets up and configures all application dependencies using dependency injection pattern.
 * It creates instances of repositories, services, and controllers in the correct order.
 */

// =============================================================================
// STUDENT MODULE IMPORTS
// =============================================================================
import { IStudentRepository } from '../repositories/studentRepository/interfaces/IStudentRepository'
import { StudentRepository } from '../repositories/studentRepository/student.Repository'
import IStudentService from '../services/studentServices/interfaces/IStudentService'
import { StudentServices } from '../services/studentServices/Student.Service'
import IStudentController from '../controllers/studentControllers/interfaces/IStudentController'
import { StudentController } from '../controllers/studentControllers/student.Controller'

// =============================================================================
// OTP MODULE IMPORTS
// =============================================================================
import IOtpRepository from '../repositories/otpRepository/interfaces/IOtpRepository'
import { OtpRepository } from '../repositories/otpRepository/Otp.Repository'
import IOtpServices from '../services/OtpService/interfaces/IOtpRepository'
import { OtpService } from '../services/OtpService/otp.Service'

// =============================================================================
// INSTRUCTOR MODULE IMPORTS
// =============================================================================
import IInstructorController from '../controllers/instructorControllers/interfaces/IInstructorController'
import { InstructorController } from '../controllers/instructorControllers/Instructor.Controller'
import IInstructorRepository from '../repositories/instructorRepository/interfaces/IInstructorRepository'
import InstructorRepository from '../repositories/instructorRepository/instructor.Repository'
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
import { InstructorVerificationRepository } from '../repositories/instructorRepository/instructorVerification.Repository'
import { IInstructorVerificationService } from '../services/instructorServices/interfaces/IInstructorVerificationService'
import { InstructorVerificationService } from '../services/instructorServices/InstructorVerification.Service'
import IInstructorVerificationController from '../controllers/instructorControllers/interfaces/IInstructorVerificationController'
import { InstructorVerificationController } from '../controllers/instructorControllers/instructorVerification.Controller'


// =============================================================================
// STUDENT PROFILE MODULE IMPORTS
// =============================================================================
import { studentProfileRepository } from '../repositories/studentRepository/studentProfile.Repository'
import { IStudentProfileRepository } from '../repositories/studentRepository/interfaces/IStudentProfileRepository'
import { IStudentProfileService } from '../services/studentServices/interfaces/IStudentProfileService'
import { StudentProfileService } from '../services/studentServices/StudentProfile.Service'
import { IStudentProfileController } from '../controllers/studentControllers/interfaces/IStudentProfileController'
import { StudentProfileController } from '../controllers/studentControllers/studentProfile.Controller'


// =============================================================================
// INSTRUCTOR PROFILE MODULE IMPORTS
// ===========================================================================
import { IInstructorProfileRepository } from '../repositories/instructorRepository/interfaces/IInstructorProfileRepository'
import { InstructorProfileRepository } from '../repositories/instructorRepository/instructorProfile.Repository'
import { IInstructorProfileService } from '../services/instructorServices/interfaces/IInstructorProfileService'
import { InstructorProfileService } from '../services/instructorServices/InstructorProfile.Service'
import { IInstructorProfileController } from '../controllers/instructorControllers/interfaces/IInstructorProfileController'
import { InstructorProfileController } from '../controllers/instructorControllers/instructorProfile.Controller'




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



/**
 * Step 7: Create STUDENT PROFILE Module
 * Handles student profile processes
 */
const studentProfileRepo: IStudentProfileRepository = new studentProfileRepository();
const studentProfileService: IStudentProfileService = new StudentProfileService(studentProfileRepo);
const studentProfileController: IStudentProfileController = new StudentProfileController(studentProfileService);




/**
 * Step 8: Create INSTRUCTOR PROFILE Module
 * Handles INSTRUCTOR profile processes
 */
const instructorProfileRepo: IInstructorProfileRepository = new InstructorProfileRepository()
const instructorProfileService: IInstructorProfileService = new InstructorProfileService(instructorProfileRepo)
const instructorProfileController: IInstructorProfileController = new InstructorProfileController(instructorProfileService)





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
  studentProfileController,
  instructorProfileController,
}



