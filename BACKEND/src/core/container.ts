/**
 * Dependency Injection Container
 *
 * This file serves as the central configuration hub for dependency injection in the application.
 * It follows the Dependency Injection pattern to create and wire up all application dependencies
 * in the correct order, ensuring proper separation of concerns and testability.
 *
 * The container creates instances of:
 * - Repositories: Data access layer components
 * - Services: Business logic layer components
 * - Controllers: Request handling layer components
 *
 * Dependencies are created in a specific order to satisfy injection requirements.
 */

// =============================================================================
// STUDENT MODULE IMPORTS
// Import all student-related interfaces and implementations
// =============================================================================
import { IStudentRepository } from '../repositories/studentRepository/interfaces/IStudentRepository'
import { StudentRepository } from '../repositories/studentRepository/student.Repository'
import IStudentService from '../services/studentServices/interfaces/IStudentService'
import { StudentServices } from '../services/studentServices/Student.Service'
import IStudentController from '../controllers/studentControllers/interfaces/IStudentController'
import { StudentController } from '../controllers/studentControllers/student.Controller'

// =============================================================================
// OTP MODULE IMPORTS
// Import OTP (One-Time Password) related components for authentication
// =============================================================================
import IOtpRepository from '../repositories/otpRepository/interfaces/IOtpRepository'
import { OtpRepository } from '../repositories/otpRepository/Otp.Repository'
import IOtpServices from '../services/OtpService/interfaces/IOtpRepository'
import { OtpService } from '../services/OtpService/otp.Service'

// =============================================================================
// INSTRUCTOR MODULE IMPORTS
// Import all instructor-related interfaces and implementations
// =============================================================================
import IInstructorController from '../controllers/instructorControllers/interfaces/IInstructorController'
import { InstructorController } from '../controllers/instructorControllers/Instructor.Controller'
import IInstructorRepository from '../repositories/instructorRepository/interfaces/IInstructorRepository'
import InstructorRepository from '../repositories/instructorRepository/instructor.Repository'
import IInstructorService from '../services/instructorServices/interfaces/IInstructorService'
import InstructorService from '../services/instructorServices/Instructor.Service'

// =============================================================================
// ADMIN MODULE IMPORTS
// Import admin-related components including specialized repositories
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
// Import components for handling admin verification workflows
// =============================================================================
import { IAdminVerificationRepository } from '../repositories/adminRepository/interfaces/IAdminVerificationRepository'
import { AdminVerificationRepository } from '../repositories/adminRepository/adminVerification.Repository'
import { IAdminVerificationService } from '../services/adminServices/interfaces/IAdminVerificationService'
import { AdminVerificationService } from '../services/adminServices/AdminVerification.Service'
import IAdminVerificationController from '../controllers/adminControllers/interfaces/IAdminVerificationController'
import { AdminVerificationController } from '../controllers/adminControllers/adminVerification.Controller'

// =============================================================================
// INSTRUCTOR VERIFICATION MODULE IMPORTS
// Import components for handling instructor verification workflows
// =============================================================================
import { IInstructorVerificationRepository } from '../repositories/instructorRepository/interfaces/IInstructorVerifcationRepository'
import { InstructorVerificationRepository } from '../repositories/instructorRepository/instructorVerification.Repository'
import { IInstructorVerificationService } from '../services/instructorServices/interfaces/IInstructorVerificationService'
import { InstructorVerificationService } from '../services/instructorServices/InstructorVerification.Service'
import IInstructorVerificationController from '../controllers/instructorControllers/interfaces/IInstructorVerificationController'
import { InstructorVerificationController } from '../controllers/instructorControllers/instructorVerification.Controller'

// =============================================================================
// STUDENT PROFILE MODULE IMPORTS
// Import components for managing student profile information
// =============================================================================
import { studentProfileRepository } from '../repositories/studentRepository/studentProfile.Repository'
import { IStudentProfileRepository } from '../repositories/studentRepository/interfaces/IStudentProfileRepository'
import { IStudentProfileService } from '../services/studentServices/interfaces/IStudentProfileService'
import { StudentProfileService } from '../services/studentServices/StudentProfile.Service'
import { IStudentProfileController } from '../controllers/studentControllers/interfaces/IStudentProfileController'
import { StudentProfileController } from '../controllers/studentControllers/studentProfile.Controller'

// =============================================================================
// INSTRUCTOR PROFILE MODULE IMPORTS
// Import components for managing instructor profile information
// =============================================================================
import { IInstructorProfileRepository } from '../repositories/instructorRepository/interfaces/IInstructorProfileRepository'
import { InstructorProfileRepository } from '../repositories/instructorRepository/instructorProfile.Repository'
import { IInstructorProfileService } from '../services/instructorServices/interfaces/IInstructorProfileService'
import { InstructorProfileService } from '../services/instructorServices/InstructorProfile.Service'
import { IInstructorProfileController } from '../controllers/instructorControllers/interfaces/IInstructorProfileController'
import { InstructorProfileController } from '../controllers/instructorControllers/instructorProfile.Controller'

// =============================================================================
// ADMIN CATEGORY MODULE IMPORTS
// Import components for admin category management functionality
// =============================================================================
import { IAdminCategoryRepository } from '../repositories/adminRepository/interfaces/IAdminCategoryRepository'
import { AdminCategoryRepository } from '../repositories/adminRepository/adminCateogy.Repository'
import { IAdminCategoryService } from '../services/adminServices/interfaces/IAdminCategoryService'
import { AdminCategoryService } from '../services/adminServices/AdminCategory.Service'
import { IAdminCategoryController } from '../controllers/adminControllers/interfaces/IAdminCategoryController'
import { AdminCategoryContoller } from '../controllers/adminControllers/adminCategory.Controller'

// =============================================================================
// INSTRUCTOR CATEGORY MODULE IMPORTS
// Import components for instructor category fetching functionality
// =============================================================================
import { IInstructorCategoryRepository } from '../repositories/instructorRepository/interfaces/IInstructorCategoryRepository'
import { InstructorCategoryRepository } from '../repositories/instructorRepository/instructorCategory.Repository'
import { IInstructorCategoryService } from '../services/instructorServices/interfaces/IInstructorCategoryService'
import { InstructorCategoryService } from '../services/instructorServices/InstructorCategory.Service'
import { IInstructorCategoryController } from '../controllers/instructorControllers/interfaces/IInstructorCategoryController'
import { InstructorCategoryController } from '../controllers/instructorControllers/instructorCategory.Controller'

// =============================================================================
// INSTRUCTOR CHAPTER MODULE IMPORTS
// Import components for instructor chapter management functionality
// =============================================================================
import { IInstructorChapterRepository } from '../repositories/instructorRepository/interfaces/IInstructorChapterRepository'
import { InstructorChapterRepository } from '../repositories/instructorRepository/instructorChapter.Repository'
import { IInstructorChapterService } from '../services/instructorServices/interfaces/IInstructorChapterService'
import { InstructorChapterService } from '../services/instructorServices/InstructorChapter.Service'
import { IInstructorChapterController } from '../controllers/instructorControllers/interfaces/IInstructorChapterController'
import { InstructorChapterController } from '../controllers/instructorControllers/instructorChapter.Controller'

// =============================================================================
// INSTRUCTOR QUIZ MODULE IMPORTS
// Import components for instructor quiz management functionality
// =============================================================================
import { IInstructorQuizRepository } from '../repositories/instructorRepository/interfaces/IInstructorQuizRepository'
import { InstructorQuizRepository } from '../repositories/instructorRepository/instructorQuiz.Repository'
import { IInstructorQuizService } from '../services/instructorServices/interfaces/IInstructorQuizService'
import { InstructorQuizService } from '../services/instructorServices/InstructorQuiz.Service'
import { IInstructorQuizController } from '../controllers/instructorControllers/interfaces/IInstructorQuizController'
import { InstructorQuizController } from '../controllers/instructorControllers/instructorQuiz.Controller'

// =============================================================================
// INSTRUCTOR COURSE MODULE IMPORTS
// Import components for instructor course management functionality
// =============================================================================
import { IInstructorCourseRepository } from '../repositories/instructorRepository/interfaces/IInstructorCourseRepository'
import { InstructorCourseRepository } from '../repositories/instructorRepository/instructorCourse.Repository'
import { IInstructorCourseService } from '../services/instructorServices/interfaces/IInstructorCourseService'
import { InstructorCourseService } from '../services/instructorServices/InstructorCourse.Service'
import { IInstructorCourseController } from '../controllers/instructorControllers/interfaces/IInstructorCourseController'
import { InstructorCourseController } from '../controllers/instructorControllers/InstructorCourse.Controller'

// =============================================================================
// ADMIN COURSE MODULE IMPORTS
// Import components for admin course management functionality
// =============================================================================
import { IAdminCourseRepository } from '../repositories/adminRepository/interfaces/IAdminCourseRepository'
import { AdminCourseRepository } from '../repositories/adminRepository/adminCourse.Repository'
import { IAdminCourseService } from '../services/adminServices/interfaces/IAdminCourseService'
import { AdminCourseService } from '../services/adminServices/AdminCourse.Service'
import { IAdminCourseController } from '../controllers/adminControllers/interfaces/IAdminCourseControllet'
import { AdminCourseController } from '../controllers/adminControllers/adminCourse.Controller'
import { ChapterDetailRepository } from '../repositories/genericRepo/Chapter.Repository'
import { QuizDetailRepository } from '../repositories/genericRepo/Quiz.Repository'

// =============================================================================
// STUDENT COURSE MODULE IMPORTS
// Import components for student course viewing and interaction functionality
// =============================================================================
import { IChapterReadOnlyRepository } from '../repositories/studentRepository/interfaces/IChapterReadOnlyRepository'
import { ChapterReadOnlyRepository } from '../repositories/studentRepository/chapterReadOnly.Repository'
import { IQuizReadOnlyRepository } from '../repositories/studentRepository/interfaces/IQuizReadOnlyRepository'
import { QuizReadOnlyRepository } from '../repositories/studentRepository/quizReadOnly.Repository'
import { IStudentCourseRepository } from '../repositories/studentRepository/interfaces/IStudentCourseRepository'
import { StudentCourseRepository } from '../repositories/studentRepository/studentCourse.Repository'
import { IStudentCourseService } from '../services/studentServices/interfaces/IStudentCourseService'
import { StudentCourseService } from '../services/studentServices/StudentCourse.Service'
import { IStudentCourseController } from '../controllers/studentControllers/interfaces/IStudentCourseController'
import { StudentCourseController } from '../controllers/studentControllers/studentCourse.Controller'

// =============================================================================
// STUDENT CATEGORY READ-ONLY MODULE IMPORTS
// Import components for student category browsing functionality
// =============================================================================
import { ICategoryReadOnlyRepository } from '../repositories/studentRepository/interfaces/ICategoryReadOnlyRepository'
import { CategoryReadOnlyRepository } from '../repositories/studentRepository/CategoryReadOnly.Repository'
import { ICategoryReadOnlyService } from '../services/studentServices/interfaces/ICategoryReadOnlyService'
import { CategoryReadOnlyService } from '../services/studentServices/CategoryReadOnly.Service'
import { ICategoryReadOnlyController } from '../controllers/studentControllers/interfaces/ICategoryReadOnlyController'
import { CategoryReadOnlyController } from '../controllers/studentControllers/CategoryReadOnly.Controller'

// =============================================================================
// STUDENT CART MODULE IMPORTS
// Import components for student shopping cart functionality
// =============================================================================
import { IStudentCartRepository } from '../repositories/studentRepository/interfaces/IStudentCartRepository'
import { StudentCartRepository } from '../repositories/studentRepository/studentCart.Repository'
import { IStudentCartService } from '../services/studentServices/interfaces/IStudentCartService'
import { StudentCartService } from '../services/studentServices/StudentCart.Service'
import { IStudentCartController } from '../controllers/studentControllers/interfaces/IStudentCartController'
import { StudentCartController } from '../controllers/studentControllers/studentCart.Controller'

// =============================================================================
// STUDENT WISHLIST MODULE IMPORTS
// Import components for student wishlist functionality
// =============================================================================
import { IStudentWishlistRepository } from '../repositories/studentRepository/interfaces/IStudentWishlistRepository'
import { StudentWishlistRepository } from '../repositories/studentRepository/studentWishlist.Repository'
import { IStudentWishlistService } from '../services/studentServices/interfaces/IStudentWishlistService'
import { StudentWishlistService } from '../services/studentServices/StudentWishlist.Service'
import { IStudentWishlistController } from '../controllers/studentControllers/interfaces/IStudentWishlistController'
import { StudentWishlistController } from '../controllers/studentControllers/studentWishlist.Controller'


// =============================================================================
// STUDENT CHECKOUT MANAGEMENT
// Purpose: Handle checkout process including payments, orders, wallet, and enrollments
// =============================================================================

import { IStudentCheckoutRepository } from '../repositories/studentRepository/interfaces/IStudentCheckoutRepository'
import { StudentCheckoutRepository } from '../repositories/studentRepository/studentCheckout.Repository'
import { IStudentCheckoutService } from '../services/studentServices/interfaces/IStudentCheckoutService'
import { StudentCheckoutService } from '../services/studentServices/StudentCheckout.Service'

import { IStudentCheckoutController } from '../controllers/studentControllers/interfaces/IStudentCheckoutController'
import { StudentCheckoutController } from '../controllers/studentControllers/studentCheckout.Controller'
import { OrderRepository } from '../repositories/genericRepo/Order.Repository'
import { PaymentRepository } from '../repositories/genericRepo/Payment.Repository'
import { EnrollmentRepository } from '../repositories/genericRepo/Enrollment.Repository'
import { CourseRepository } from '../repositories/genericRepo/Course.Repository'

import { IWalletRepository } from '../repositories/genericRepo/interfaces/IWalletRepository'
import { WalletRepository } from '../repositories/genericRepo/Wallet.Repository'

import { IWalletService } from '../services/genericService/interfaces/IWalletService'
import { WalletService } from '../services/genericService/wallet.Service' 





// =============================================================================
// DEPENDENCY INJECTION SETUP
// Create and configure all application dependencies in the correct order
// =============================================================================

/**
 * STEP 1: CREATE FOUNDATIONAL SERVICES
 * These are base services that don't depend on other business logic services
 * and are commonly used across multiple modules
 */

// Create OTP service - Used for authentication across student and instructor modules
const otpRepository: IOtpRepository = new OtpRepository()
const otpService: IOtpServices = new OtpService(otpRepository)

/**
 * STEP 2: CREATE STUDENT MODULE DEPENDENCIES
 * Wire up student-related components following Repository -> Service -> Controller pattern
 * Student controller depends on both student service and OTP service for authentication
 */
const studentRepository: IStudentRepository = new StudentRepository()
const studentService: IStudentService = new StudentServices(studentRepository)
const studentController: IStudentController = new StudentController(studentService, otpService)

/**
 * STEP 3: CREATE INSTRUCTOR MODULE DEPENDENCIES
 * Wire up instructor-related components following Repository -> Service -> Controller pattern
 * Instructor controller depends on both instructor service and OTP service for authentication
 */
const instructorRepository: IInstructorRepository = new InstructorRepository()
const instructorService: IInstructorService = new InstructorService(instructorRepository)
const instructorController: IInstructorController = new InstructorController(
  instructorService,
  otpService,
)

/**
 * STEP 4: CREATE ADMIN MODULE DEPENDENCIES
 * Admin module uses a composite pattern with multiple specialized repositories
 * The main admin repository aggregates user and instructor repositories
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
 * STEP 5: CREATE ADMIN VERIFICATION MODULE
 * Handles verification processes for admin operations
 * Reuses instructor service for verification logic to maintain consistency
 */
const adminVerificationRepository: IAdminVerificationRepository = new AdminVerificationRepository()
const adminVerificationService: IAdminVerificationService = new AdminVerificationService(
  adminVerificationRepository,
  instructorService, // Reusing instructor service for consistent verification logic
)
const adminVerificationController: IAdminVerificationController = new AdminVerificationController(
  adminVerificationService,
)

/**
 * STEP 6: CREATE INSTRUCTOR VERIFICATION MODULE
 * Handles verification processes specific to instructor operations
 * Independent verification logic for instructor-specific workflows
 */
const instructorVerificationRepository: IInstructorVerificationRepository =
  new InstructorVerificationRepository()
const instructorVerificationService: IInstructorVerificationService =
  new InstructorVerificationService(instructorVerificationRepository)
const instructorVerificationController: IInstructorVerificationController =
  new InstructorVerificationController(instructorVerificationService)

/**
 * STEP 7: CREATE STUDENT PROFILE MODULE
 * Handles student profile management operations
 * Provides functionality for students to manage their personal information
 */
const studentProfileRepo: IStudentProfileRepository = new studentProfileRepository()
const studentProfileService: IStudentProfileService = new StudentProfileService(studentProfileRepo)
const studentProfileController: IStudentProfileController = new StudentProfileController(
  studentProfileService,
)

/**
 * STEP 8: CREATE INSTRUCTOR PROFILE MODULE
 * Handles instructor profile management operations
 * Provides functionality for instructors to manage their professional information
 */
const instructorProfileRepo: IInstructorProfileRepository = new InstructorProfileRepository()
const instructorProfileService: IInstructorProfileService = new InstructorProfileService(
  instructorProfileRepo,
)
const instructorProfileController: IInstructorProfileController = new InstructorProfileController(
  instructorProfileService,
)

/**
 * STEP 9: CREATE ADMIN CATEGORY MODULE
 * Handles category management operations from admin perspective
 * Allows admins to create, update, and manage course categories
 */
const adminCategoryRepository: IAdminCategoryRepository = new AdminCategoryRepository()
const adminCategoryServie: IAdminCategoryService = new AdminCategoryService(adminCategoryRepository)
const adminCategoryController: IAdminCategoryController = new AdminCategoryContoller(
  adminCategoryServie,
)

/**
 * STEP 10: CREATE INSTRUCTOR CATEGORY MODULE
 * Handles category fetching operations from instructor perspective
 * Allows instructors to view and select categories for their courses
 */
const instructorCategoryRepository: IInstructorCategoryRepository =
  new InstructorCategoryRepository()
const instructorCategoryService: IInstructorCategoryService = new InstructorCategoryService(
  instructorCategoryRepository,
)
const instructorCategoryController: IInstructorCategoryController =
  new InstructorCategoryController(instructorCategoryService)

/**
 * STEP 11: CREATE INSTRUCTOR CHAPTER MODULE
 * Handles chapter management operations for instructors
 * Allows instructors to create, edit, and organize course chapters
 */
const instructorChapterRepository: IInstructorChapterRepository = new InstructorChapterRepository()
const instructorChapterService: IInstructorChapterService = new InstructorChapterService(
  instructorChapterRepository,
)
const instructorChapterController: IInstructorChapterController = new InstructorChapterController(
  instructorChapterService,
)

/**
 * STEP 12: CREATE INSTRUCTOR QUIZ MODULE
 * Handles quiz management operations for instructors
 * Allows instructors to create, edit, and manage quizzes within their courses
 */
const instructorQuizRepository: IInstructorQuizRepository = new InstructorQuizRepository()
const instructorQuizService: IInstructorQuizService = new InstructorQuizService(
  instructorQuizRepository,
)
const instructorQuizController: IInstructorQuizController = new InstructorQuizController(
  instructorQuizService,
)

/**
 * STEP 13: CREATE INSTRUCTOR COURSE MODULE
 * Handles comprehensive course management for instructors
 * Depends on chapter and quiz repositories to manage complete course content
 * This service aggregates chapter and quiz functionality for full course management
 */
const instructorCourseRepository: IInstructorCourseRepository = new InstructorCourseRepository()
const instructorCourseService: IInstructorCourseService = new InstructorCourseService(
  instructorCourseRepository,
  instructorChapterRepository, // Injecting chapter repo for course content management
  instructorQuizRepository, // Injecting quiz repo for course assessment management
)
const instructorCourseController: IInstructorCourseController = new InstructorCourseController(
  instructorCourseService,
)

/**
 * STEP 14: CREATE ADMIN COURSE MODULE
 * Handles course management operations from admin perspective
 * Admin repository is initialized with generic chapter and quiz repositories
 * for comprehensive course oversight and management capabilities
 */
const adminCourseRepository: IAdminCourseRepository = new AdminCourseRepository(
  new ChapterDetailRepository(),
  new QuizDetailRepository(),
)
const adminCourseService: IAdminCourseService = new AdminCourseService(adminCourseRepository)
const adminCourseController: IAdminCourseController = new AdminCourseController(adminCourseService)

/**
 * STEP 15: CREATE STUDENT COURSE MODULE
 * Handles course viewing and interaction from student perspective
 * Uses read-only repositories to ensure students can view but not modify course content
 * Aggregates chapter and quiz read-only access for complete course consumption
 */
const chapterReadOnlyRepository: IChapterReadOnlyRepository = new ChapterReadOnlyRepository()
const quizReadOnlyRepository: IQuizReadOnlyRepository = new QuizReadOnlyRepository()
const studentCourseRepository: IStudentCourseRepository = new StudentCourseRepository(
  chapterReadOnlyRepository, // Read-only access to chapter content
  quizReadOnlyRepository, // Read-only access to quiz content
)
const studentCourseService: IStudentCourseService = new StudentCourseService(
  studentCourseRepository,
)
const studentCourseController: IStudentCourseController = new StudentCourseController(
  studentCourseService,
)

/**
 * STEP 16: CREATE STUDENT CATEGORY READ-ONLY MODULE
 * Handles category browsing functionality for students
 * Provides read-only access to categories so students can browse available course categories
 */
const categoryReadOnlyRepository: ICategoryReadOnlyRepository = new CategoryReadOnlyRepository()
const categoryReadOnlyService: ICategoryReadOnlyService = new CategoryReadOnlyService(
  categoryReadOnlyRepository,
)
const categoryReadOnlyController: ICategoryReadOnlyController = new CategoryReadOnlyController(
  categoryReadOnlyService,
)

/**
 * STEP 17: CREATE STUDENT CART MODULE
 * Handles shopping cart functionality for students
 * Manages adding, removing, and purchasing courses through cart system
 */
const studentCartRepository: IStudentCartRepository = new StudentCartRepository()
const studentCartService: IStudentCartService = new StudentCartService(studentCartRepository)
const studentCartController: IStudentCartController = new StudentCartController(studentCartService)

/**
 * STEP 18: CREATE STUDENT WISHLIST MODULE
 * Handles wishlist functionality for students
 * Allows students to save courses for later consideration and easy access
 */
const studentWishlistRepository: IStudentWishlistRepository = new StudentWishlistRepository()
const studentWishlistService: IStudentWishlistService = new StudentWishlistService(
  studentWishlistRepository,
)
const studentWishlistController: IStudentWishlistController = new StudentWishlistController(
  studentWishlistService,
)



/**
 * STEP 19: STUDENT CHECKOUT MANAGEMENT
 * Handle checkout process including payments, orders, wallet, and enrollments
 */

const walletRepository: IWalletRepository = new WalletRepository();
const walletService: IWalletService = new WalletService(
  walletRepository,
  adminRepository
);

const studentCheckoutRepository: IStudentCheckoutRepository =
  new StudentCheckoutRepository(
    new OrderRepository(),
    new PaymentRepository(),
    new EnrollmentRepository(),
    new CourseRepository()
  );
const studentCheckoutService: IStudentCheckoutService =
  new StudentCheckoutService(
    studentCheckoutRepository,
    studentCartRepository,
    walletService
  );
const studentCheckoutController: IStudentCheckoutController =
  new StudentCheckoutController(studentCheckoutService);

















// =============================================================================
// EXPORTS
// Export all configured controllers for use in route handlers
// =============================================================================

/**
 * Export all controllers for use in route handlers
 * These controllers serve as the entry points for handling HTTP requests
 * and are fully configured with their dependencies
 *
 * Controllers are organized by domain:
 * - Core user management: student, instructor, admin controllers
 * - Verification workflows: admin and instructor verification controllers
 * - Profile management: student and instructor profile controllers
 * - Content management: category, course, chapter, quiz controllers
 * - Student features: cart, wishlist, course viewing controllers
 */
export {
  // Core user management controllers
  studentController, // Handles student authentication and basic operations
  instructorController, // Handles instructor authentication and basic operations
  adminController, // Handles admin operations and user management

  // Verification workflow controllers
  adminVerificationController, // Handles admin verification processes
  instructorVerificationController, // Handles instructor verification processes

  // Profile management controllers
  studentProfileController, // Handles student profile management
  instructorProfileController, // Handles instructor profile management

  // Content management controllers
  adminCategoryController, // Handles category management by admins
  instructorCategoryController, // Handles category viewing by instructors
  instructorChapterController, // Handles chapter management by instructors
  instructorQuizController, // Handles quiz management by instructors
  instructorCourseController, // Handles course management by instructors
  adminCourseController, // Handles course oversight by admins

  // Student-focused controllers
  studentCourseController, // Handles course viewing and interaction by students
  categoryReadOnlyController, // Handles category browsing by students
  studentCartController, // Handles shopping cart functionality
  studentWishlistController, // Handles wishlist functionality
  
  studentCheckoutController,
}
