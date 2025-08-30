/**
 * Dependency Injection Container
 *
 * This file creates and configures all application dependencies using the Dependency Injection pattern.
 * It ensures proper separation of concerns and makes the application testable by managing object creation
 * and wiring dependencies in the correct order.
 *
 * Architecture Pattern: Repository -> Service -> Controller
 * - Repositories: Handle data access and database operations
 * - Services: Contain business logic and coordinate between repositories
 * - Controllers: Handle HTTP requests and responses, use services for business operations
 *
 * Dependencies are created in a specific order to satisfy injection requirements.
 */

// =============================================================================
// STUDENT MODULE IMPORTS
// All components related to student functionality including authentication and basic operations
// =============================================================================
import { IStudentRepository } from '../repositories/studentRepository/interfaces/IStudentRepository'
import { StudentRepository } from '../repositories/studentRepository/student.Repository'
import IStudentService from '../services/studentServices/interfaces/IStudentService'
import { StudentServices } from '../services/studentServices/Student.Service'
import IStudentController from '../controllers/studentControllers/interfaces/IStudentController'
import { StudentController } from '../controllers/studentControllers/student.Controller'

// =============================================================================
// OTP MODULE IMPORTS
// One-Time Password functionality for secure authentication across all user types
// =============================================================================
import IOtpRepository from '../repositories/otpRepository/interfaces/IOtpRepository'
import { OtpRepository } from '../repositories/otpRepository/Otp.Repository'
import IOtpServices from '../services/OtpService/interfaces/IOtpRepository'
import { OtpService } from '../services/OtpService/otp.Service'

// =============================================================================
// INSTRUCTOR MODULE IMPORTS
// All components for instructor functionality including course creation and management
// =============================================================================
import IInstructorController from '../controllers/instructorControllers/interfaces/IInstructorController'
import { InstructorController } from '../controllers/instructorControllers/Instructor.Controller'
import IInstructorRepository from '../repositories/instructorRepository/interfaces/IInstructorRepository' 
import InstructorRepository from '../repositories/instructorRepository/instructor.Repository'
import IInstructorService from '../services/instructorServices/interfaces/IInstructorService'
import InstructorService from '../services/instructorServices/Instructor.Service'

// =============================================================================
// ADMIN MODULE IMPORTS
// Admin functionality with composite repositories for managing users and instructors
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
// Admin-side verification processes for approving instructors and managing verifications
// =============================================================================
import { IAdminVerificationRepository } from '../repositories/adminRepository/interfaces/IAdminVerificationRepository'
import { AdminVerificationRepository } from '../repositories/adminRepository/adminVerification.Repository'
import { IAdminVerificationService } from '../services/adminServices/interfaces/IAdminVerificationService'
import { AdminVerificationService } from '../services/adminServices/AdminVerification.Service'
import IAdminVerificationController from '../controllers/adminControllers/interfaces/IAdminVerificationController'
import { AdminVerificationController } from '../controllers/adminControllers/adminVerification.Controller'

// =============================================================================
// INSTRUCTOR VERIFICATION MODULE IMPORTS
// Instructor-side verification processes for submitting verification requests
// =============================================================================
import { IInstructorVerificationRepository } from '../repositories/instructorRepository/interfaces/IInstructorVerifcationRepository'
import { InstructorVerificationRepository } from '../repositories/instructorRepository/instructorVerification.Repository'
import { IInstructorVerificationService } from '../services/instructorServices/interfaces/IInstructorVerificationService'
import { InstructorVerificationService } from '../services/instructorServices/InstructorVerification.Service'
import IInstructorVerificationController from '../controllers/instructorControllers/interfaces/IInstructorVerificationController'
import { InstructorVerificationController } from '../controllers/instructorControllers/instructorVerification.Controller'

// =============================================================================
// STUDENT PROFILE MODULE IMPORTS
// Student personal profile management including personal information updates
// =============================================================================
import { studentProfileRepository } from '../repositories/studentRepository/studentProfile.Repository'
import { IStudentProfileRepository } from '../repositories/studentRepository/interfaces/IStudentProfileRepository'
import { IStudentProfileService } from '../services/studentServices/interfaces/IStudentProfileService'
import { StudentProfileService } from '../services/studentServices/StudentProfile.Service'
import { IStudentProfileController } from '../controllers/studentControllers/interfaces/IStudentProfileController'
import { StudentProfileController } from '../controllers/studentControllers/studentProfile.Controller'

// =============================================================================
// INSTRUCTOR PROFILE MODULE IMPORTS
// Instructor professional profile management including bio, qualifications, and experience
// =============================================================================
import { IInstructorProfileRepository } from '../repositories/instructorRepository/interfaces/IInstructorProfileRepository'
import { InstructorProfileRepository } from '../repositories/instructorRepository/instructorProfile.Repository'
import { IInstructorProfileService } from '../services/instructorServices/interfaces/IInstructorProfileService'
import { InstructorProfileService } from '../services/instructorServices/InstructorProfile.Service'
import { IInstructorProfileController } from '../controllers/instructorControllers/interfaces/IInstructorProfileController'
import { InstructorProfileController } from '../controllers/instructorControllers/instructorProfile.Controller'

// =============================================================================
// ADMIN CATEGORY MODULE IMPORTS
// Admin category management for creating, editing, and organizing course categories
// =============================================================================
import { IAdminCategoryRepository } from '../repositories/adminRepository/interfaces/IAdminCategoryRepository'
import { AdminCategoryRepository } from '../repositories/adminRepository/adminCateogy.Repository'
import { IAdminCategoryService } from '../services/adminServices/interfaces/IAdminCategoryService'
import { AdminCategoryService } from '../services/adminServices/AdminCategory.Service'
import { IAdminCategoryController } from '../controllers/adminControllers/interfaces/IAdminCategoryController'
import { AdminCategoryContoller } from '../controllers/adminControllers/adminCategory.Controller'

// =============================================================================
// INSTRUCTOR CATEGORY MODULE IMPORTS
// Instructor category viewing functionality for selecting categories when creating courses
// =============================================================================
import { IInstructorCategoryRepository } from '../repositories/instructorRepository/interfaces/IInstructorCategoryRepository'
import { InstructorCategoryRepository } from '../repositories/instructorRepository/instructorCategory.Repository'
import { IInstructorCategoryService } from '../services/instructorServices/interfaces/IInstructorCategoryService'
import { InstructorCategoryService } from '../services/instructorServices/InstructorCategory.Service'
import { IInstructorCategoryController } from '../controllers/instructorControllers/interfaces/IInstructorCategoryController'
import { InstructorCategoryController } from '../controllers/instructorControllers/instructorCategory.Controller'

// =============================================================================
// INSTRUCTOR CHAPTER MODULE IMPORTS
// Chapter management for instructors to create and organize course content into chapters
// =============================================================================
import { IInstructorChapterRepository } from '../repositories/instructorRepository/interfaces/IInstructorChapterRepository'
import { InstructorChapterRepository } from '../repositories/instructorRepository/instructorChapter.Repository'
import { IInstructorChapterService } from '../services/instructorServices/interfaces/IInstructorChapterService'
import { InstructorChapterService } from '../services/instructorServices/InstructorChapter.Service'
import { IInstructorChapterController } from '../controllers/instructorControllers/interfaces/IInstructorChapterController'
import { InstructorChapterController } from '../controllers/instructorControllers/instructorChapter.Controller'

// =============================================================================
// INSTRUCTOR QUIZ MODULE IMPORTS
// Quiz management for instructors to create assessments and track student progress
// =============================================================================
import { IInstructorQuizRepository } from '../repositories/instructorRepository/interfaces/IInstructorQuizRepository'
import { InstructorQuizRepository } from '../repositories/instructorRepository/instructorQuiz.Repository'
import { IInstructorQuizService } from '../services/instructorServices/interfaces/IInstructorQuizService'
import { InstructorQuizService } from '../services/instructorServices/InstructorQuiz.Service'
import { IInstructorQuizController } from '../controllers/instructorControllers/interfaces/IInstructorQuizController'
import { InstructorQuizController } from '../controllers/instructorControllers/instructorQuiz.Controller'

// =============================================================================
// INSTRUCTOR COURSE MODULE IMPORTS
// Complete course management combining chapters and quizzes for full course creation
// =============================================================================
import { IInstructorCourseRepository } from '../repositories/instructorRepository/interfaces/IInstructorCourseRepository'
import { InstructorCourseRepository } from '../repositories/instructorRepository/instructorCourse.Repository'
import { IInstructorCourseService } from '../services/instructorServices/interfaces/IInstructorCourseService'
import { InstructorCourseService } from '../services/instructorServices/InstructorCourse.Service'
import { IInstructorCourseController } from '../controllers/instructorControllers/interfaces/IInstructorCourseController'
import { InstructorCourseController } from '../controllers/instructorControllers/InstructorCourse.Controller'

// =============================================================================
// ADMIN COURSE MODULE IMPORTS
// Admin course oversight including approval, monitoring, and management capabilities
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
// Student course consumption with read-only access to content and progress tracking
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
// Student category browsing for discovering and filtering available courses by category
// =============================================================================
import { ICategoryReadOnlyRepository } from '../repositories/studentRepository/interfaces/ICategoryReadOnlyRepository'
import { CategoryReadOnlyRepository } from '../repositories/studentRepository/CategoryReadOnly.Repository'
import { ICategoryReadOnlyService } from '../services/studentServices/interfaces/ICategoryReadOnlyService'
import { CategoryReadOnlyService } from '../services/studentServices/CategoryReadOnly.Service'
import { ICategoryReadOnlyController } from '../controllers/studentControllers/interfaces/ICategoryReadOnlyController'
import { CategoryReadOnlyController } from '../controllers/studentControllers/CategoryReadOnly.Controller'

// =============================================================================
// STUDENT CART MODULE IMPORTS
// Shopping cart functionality for adding courses and managing purchases before checkout
// =============================================================================
import { IStudentCartRepository } from '../repositories/studentRepository/interfaces/IStudentCartRepository'
import { StudentCartRepository } from '../repositories/studentRepository/studentCart.Repository'
import { IStudentCartService } from '../services/studentServices/interfaces/IStudentCartService'
import { StudentCartService } from '../services/studentServices/StudentCart.Service'
import { IStudentCartController } from '../controllers/studentControllers/interfaces/IStudentCartController'
import { StudentCartController } from '../controllers/studentControllers/studentCart.Controller'

// =============================================================================
// STUDENT WISHLIST MODULE IMPORTS
// Wishlist functionality for saving courses for future consideration and easy access
// =============================================================================
import { IStudentWishlistRepository } from '../repositories/studentRepository/interfaces/IStudentWishlistRepository'
import { StudentWishlistRepository } from '../repositories/studentRepository/studentWishlist.Repository'
import { IStudentWishlistService } from '../services/studentServices/interfaces/IStudentWishlistService'
import { StudentWishlistService } from '../services/studentServices/StudentWishlist.Service'
import { IStudentWishlistController } from '../controllers/studentControllers/interfaces/IStudentWishlistController'
import { StudentWishlistController } from '../controllers/studentControllers/studentWishlist.Controller'

// =============================================================================
// STUDENT CHECKOUT MODULE IMPORTS
// Complete checkout process including payment processing, order creation, and enrollment
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

// =============================================================================
// WALLET SYSTEM IMPORTS
// Digital wallet functionality for managing user balances and transactions
// =============================================================================
import { IWalletRepository } from '../repositories/genericRepo/interfaces/IWalletRepository'
import { WalletRepository } from '../repositories/genericRepo/Wallet.Repository'
import { IWalletService } from '../services/genericService/interfaces/IWalletService'
import { WalletService } from '../services/genericService/wallet.Service'

// =============================================================================
// DASHBOARD SYSTEM IMPORTS
// Analytics and reporting dashboards for instructors to track course performance
// =============================================================================
import { IInstructorAllCourseDashboardRepository } from '../repositories/instructorRepository/interfaces/IInstructorAllCourseDashboardRepository'
import { InstructorAllCourseDashboardRepository } from '../repositories/instructorRepository/instructorAllCourseDashboard.Repository'
import { IInstructorAllCourseDashboardService } from '../services/instructorServices/interfaces/IInstructorAllDashboardService'
import { InstructorAllCourseDashboardService } from '../services/instructorServices/InstructorAllDashboard.Service'
import { IInstructorAllDashboardController } from '../controllers/instructorControllers/interfaces/IInstructorAllDashboardController'
import { InstructorAllCourseDashboardController } from '../controllers/instructorControllers/instructorAllDashboard.Controller'

// =============================================================================
// COURSE-SPECIFIC DASHBOARD IMPORTS
// Detailed analytics for individual courses including enrollment and performance metrics
// =============================================================================
import { IInstructorCourseSpecificDashboardRepository } from '../repositories/instructorRepository/interfaces/IInstructorSpecificCourseDashboardRepository'
import { InstructorSpecificCourseDashboardRepository } from '../repositories/instructorRepository/instructorSpecificCourse.DashboardRepository'
import { IInstructorSpecificCourseDashboardService } from '../services/instructorServices/interfaces/IInstructorSpecificCourseService'
import { InstructorSpecificCourseDashboardService } from '../services/instructorServices/InstructorSpecificCourse.Service'
import { IInstructorCourseSpecificDashboardController } from '../controllers/instructorControllers/interfaces/IInstructorSpecificCourseController'
import { InstructorSpecificCourseDashboardController } from '../controllers/instructorControllers/instructorSpecificCourse.Controller'

// =============================================================================
// STUDENT ENROLLMENT TRACKING IMPORTS
// Student enrollment history and course access management
// =============================================================================
import { IStudentEnrollmentRepository } from '../repositories/studentRepository/interfaces/IStudentEnrollmentRepository'
import { StudentEnrollmentRepository } from '../repositories/studentRepository/studentEnrollement.Repository'
import { IStudentEnrollmentService } from '../services/studentServices/interfaces/IStudentEnrollmentService'
import { StudentEnrollmentService } from '../services/studentServices/StudentEnrollment.Service'
import { IStudentEnrollmentController } from '../controllers/studentControllers/interfaces/IStudentEnrollmentController'
import { StudentEnrollmentController } from '../controllers/studentControllers/studentEnrollment.Controller'

// =============================================================================
// STUDENT WALLET MANAGEMENT IMPORTS
// Student-specific wallet operations including balance viewing and transaction history
// =============================================================================
import { IStudentWalletController } from '../controllers/studentControllers/interfaces/IStudentWalletController'
import { StudentWalletController } from '../controllers/studentControllers/studentWallet.Controller'

// =============================================================================
// WALLET PAYMENT SYSTEM IMPORTS
// Payment processing through digital wallet including top-ups and withdrawals
// =============================================================================
import { IWalletPaymentRepository } from '../repositories/genericRepo/interfaces/IWalletPaymentRepository'
import { WalletPaymentRepository } from '../repositories/genericRepo/walletPayment.Repository'
import { IWalletPaymentService } from '../services/genericService/interfaces/IWalletPaymentService'
import { WalletPaymentService } from '../services/genericService/walletPayment.Service'
import { IWalletPaymentController } from '../controllers/studentControllers/interfaces/IStudentWalletPaymentController'
import { StudentWalletPaymentController } from '../controllers/studentControllers/studentWalletPayment.Controller'

// =============================================================================
// INSTRUCTOR WALLET MANAGEMENT IMPORTS
// Instructor earnings management and wallet operations for course revenue
// =============================================================================
import { IInstructorWalletController } from '../controllers/instructorControllers/interfaces/IInstructorWalletController'
import { InstructorWalletController } from '../controllers/instructorControllers/instructorWallet.Controller'

// =============================================================================
// INSTRUCTOR WALLET PAYMENT IMPORTS
// Payment processing for instructor earnings including withdrawal requests
// =============================================================================
import { IInstructorWalletPaymentController } from '../controllers/instructorControllers/interfaces/IInstructorWalletPaymentController'
import { InstructorWalletPaymentController } from '../controllers/instructorControllers/instructorWalletPayment.Controller'

// =============================================================================
// ADMIN WALLET MANAGEMENT IMPORTS
// Admin oversight of all wallet operations and transaction monitoring
// =============================================================================
import { IAdminWalletController } from '../controllers/adminControllers/interfaces/IAdminWalletController'
import { AdminWalletController } from '../controllers/adminControllers/adminWallet.Controller'

// =============================================================================
// ADMIN WALLET PAYMENT IMPORTS
// Admin control over payment processing and transaction approvals
// =============================================================================
import { IAdminWalletPaymentController } from '../controllers/adminControllers/interfaces/IAdminWalletPaymentController'
import { AdminWalletPaymentController } from '../controllers/adminControllers/adminWalletPayment.Controller'

// =============================================================================
// WITHDRAWAL REQUEST SYSTEM IMPORTS
// Instructor withdrawal requests and admin approval workflow for earnings
// =============================================================================
import { IWithdrawalRequestRepository } from '../repositories/genericRepo/interfaces/IWithdrawalRequestRepository'
import { WithdrawalRequestRepository } from '../repositories/genericRepo/withdrawalRequest.Repository'
import { IWithdrawalRequestService } from '../services/genericService/interfaces/IWithdrawalRequestService'
import { WithdrawalRequestService } from '../services/genericService/withdrawalRequest.Service'
import { IInstructorWithdrawalController } from '../controllers/instructorControllers/interfaces/IInstructorWithdrawalController'
import { InstructorWithdrawalController } from '../controllers/instructorControllers/instructorWithdrawal.Controller'

// =============================================================================
// ADMIN WITHDRAWAL MANAGEMENT IMPORTS
// Admin interface for processing and approving instructor withdrawal requests
// =============================================================================
import { IAdminWithdrawalController } from '../controllers/adminControllers/interfaces/IAdminWithdrawalController'
import { AdminWithdrawalController } from '../controllers/adminControllers/adminWithdrawal.Controller'

// =============================================================================
// STUDENT ORDER HISTORY IMPORTS
// Student purchase history and order tracking functionality
// =============================================================================
import { IStudentOrderRepository } from '../repositories/studentRepository/interfaces/IStudentOrderRepository'
import { StudentOrderRepository } from '../repositories/studentRepository/studentOrder.Repository'
import { IStudentOrderService } from '../services/studentServices/interfaces/IStudentOrderService'
import { StudentOrderService } from '../services/studentServices/StudentOrder.Service'
import { IStudentOrderController } from '../controllers/studentControllers/interfaces/IStudentOrderController'
import { StudentOrderController } from '../controllers/studentControllers/studentOrder.Controller'



// =============================================================================
// ADMIN MEMBERSHIP MANAGEMENT IMPORTS
// Admin can create, update, and manage membership plans
// =============================================================================
import { IAdminMembershipRepository } from '../repositories/adminRepository/interfaces/IAdminMembershipRepository'
import { AdminMembershipRepository } from '../repositories/adminRepository/adminMembership.Repository'
import { IAdminMembershipService } from '../services/adminServices/interfaces/IAdminMembershipService'
import { AdminMembershipService } from "../services/adminServices/AdminMembership.Service";
import { IAdminMembershipController } from '../controllers/adminControllers/interfaces/IAdminMembershipController'
import { AdminMembershipController } from '../controllers/adminControllers/adminMembership.Controller'

// =============================================================================
// INSTRUCTOR MEMBERSHIP MANAGEMENT IMPORTS
// Instructors can view and subscribe to available membership plans
// =============================================================================
import { IInstructorMembershipRepository } from '../repositories/instructorRepository/interfaces/IInstructorMembershipRepository' 
import { InstructorMembershipRepository } from '../repositories/instructorRepository/instructorMembership.Repository' 
import { IInstructorMembershipService } from '../services/instructorServices/interfaces/IInstructorMembershipService' 
import { InstructorMembershipService } from "../services/instructorServices/InstructorMembership.Service";
import { IInstructorMembershipController } from '../controllers/instructorControllers/interfaces/IInstructorMembershipController' 
import { InstructorMembershipController } from '../controllers/instructorControllers/instructorMembership.Controller' 

// =============================================================================
// INSTRUCTOR MEMBERSHIP ORDER IMPORTS
// Handles instructor checkout and membership payment flows
// =============================================================================
import { IInstructorMembershipOrderRepository } from '../repositories/instructorRepository/interfaces/IInstructorMembershipOrderRepository' 
import { InstructorMembershipOrderRepository } from '../repositories/instructorRepository/instructorMembershipOrder.Repository' 
import { IInstructorMembershipOrderService } from '../services/instructorServices/interfaces/IInstructorMembershipOrderService' 
import { InstructorMembershipOrderService } from '../services/instructorServices/InstructorMembershipOrder.Service' 
import { IInstructorMembershipOrderController } from '../controllers/instructorControllers/interfaces/IInstructorMembershipOrderController'
import { InstructorMembershipOrderController } from '../controllers/instructorControllers/instructorMembershipOrder.Controller'
import { razorpay } from "../utils/razorpay";
import { SendEmail } from "../utils/sendOtpEmail";
import { IEmail } from "../types/Email";

// =============================================================================
// ADMIN MEMBERSHIP ORDER IMPORTS
// Admin monitoring and handling of instructor membership orders
// =============================================================================
import { IAdminMembershipOrderRepository } from '../repositories/adminRepository/interfaces/IAdminMembershipOrderRepository' 
import { AdminMembershipOrderRepository } from "../repositories/adminRepository/adminMembershipOrder.Repository";
import { IAdminMembershipOrderService } from '../services/adminServices/interfaces/IAdminMembershipOrderService' 
import { AdminMembershipOrderService } from '../services/adminServices/AdminMembershipOrder.Service' 
import { IAdminMembershipOrderController } from '../controllers/adminControllers/interfaces/IAdminMembershipOrderController' 
import { AdminMembershipOrderController } from "../controllers/adminControllers/adminMembershipOrder.Controller";

// =============================================================================
// INSTRUCTOR SLOT MANAGEMENT IMPORTS
// Instructors manage availability slots for student bookings
// =============================================================================
import { IInstructorSlotRepository } from '../repositories/instructorRepository/interfaces/IInstructorSlotRepository' 
import { InstructorSlotRepository } from '../repositories/instructorRepository/instructorSlot.Repository' 
import { IInstructorSlotService } from '../services/instructorServices/interfaces/IInstructorSlotService'
import { InstructorSlotService } from '../services/instructorServices/InstructorSlot.Service' 
import { IInstructorSlotController } from '../controllers/instructorControllers/interfaces/IInstructorSlotController' 
import { InstructorSlotController } from '../controllers/instructorControllers/instructorSlot.Controller' 

// =============================================================================
// STUDENT INSTRUCTOR LISTING IMPORTS
// Students browse available instructors
// =============================================================================
import { IStudentInstructorListingRepository } from '../repositories/studentRepository/interfaces/IStudentInstructorListingRepository' 
import { StudentInstructorListingRepository } from '../repositories/studentRepository/studentInstructorListing.Repository' 
import { IStudentInstructorListingService } from '../services/studentServices/interfaces/IStudentInstructorListingService' 
import { StudentInstructorListingService } from "../services/studentServices/StudentInstructorListing.Service";
import { IStudentInstructorListingController } from "../controllers/studentControllers/interfaces/IStudentInstructorListingController";
import { StudentInstructorListingController } from '../controllers/studentControllers/studentInstructorListing.Controller'

// =============================================================================
// STUDENT SLOT VIEWING IMPORTS
// Students view instructor slot availability
// =============================================================================
import { IStudentSlotRepository } from '../repositories/studentRepository/interfaces/IStudentSlotRepository' 
import { StudentSlotRepository } from '../repositories/studentRepository/StudentSlot.Repository' 
import { IStudentSlotService } from '../services/studentServices/interfaces/IStudentSlotService' 
import { StudentSlotService } from '../services/studentServices/StudentSlot.Service'
import { IStudentSlotController } from '../controllers/studentControllers/interfaces/IStudentSlotController' 
import { StudentSlotController } from '../controllers/studentControllers/studentSlot.Controller' 

// =============================================================================
// STUDENT SLOT BOOKING IMPORTS
// Students book instructor slots and manage wallet payments
// =============================================================================
import { IStudentSlotBookingRepository } from '../repositories/studentRepository/interfaces/IStudentSlotBookingRepository' 
import { StudentSlotBookingRepository } from '../repositories/studentRepository/studentSlotBooking.Repository'
import { IStudentSlotBookingService } from '../services/studentServices/interfaces/IStudentSlotBookingService' 
import { StudentSlotBookingService } from '../services/studentServices/StudentSlotBooking.Service' 
import { IStudentSlotBookingController } from "../controllers/studentControllers/interfaces/IStudentSlotBookingController";
import { StudentSlotBookingController } from '../controllers/studentControllers/studentSlotBooking.Controller' 

// =============================================================================
// INSTRUCTOR BOOKED SLOT IMPORTS
// Instructors view and manage booked slots
// =============================================================================
import { IInstructorSlotBookingRepository } from '../repositories/studentRepository/interfaces/IInstructorSlotBookingRepository' 
import { InstructorSlotBookingRepository } from '../repositories/studentRepository/instructorSlotBooking.Repository' 
import { IInstructorSlotBookingService } from '../services/instructorServices/interfaces/IInstructorSlotBookingService' 
import { InstructorSlotBookingService } from '../services/instructorServices/InstructorSlotBooking.Service'
import { IInstructorSlotBookingController } from '../controllers/instructorControllers/interfaces/IInstructorSlotBookingController' 
import { InstructorSlotBookingController } from '../controllers/instructorControllers/instructorSlotBooking.Controller' 

// =============================================================================
// ADMIN DASHBOARD IMPORTS
// Admin dashboard with stats: courses, orders, instructors, memberships
// =============================================================================
import { IAdminDashboardRepository } from '../repositories/adminRepository/interfaces/IAdminDashboardRepository'
import { AdminDashboardRepository } from '../repositories/adminRepository/adminDashboard.Repository' 
import { IAdminDashboardService } from '../services/adminServices/interfaces/IAdminDashboardService' 
import { AdminDashboardService } from '../services/adminServices/AdminDashboard.Service' 
import { IAdminDashboardController } from '../controllers/adminControllers/interfaces/IAdminDashboardController' 
import { AdminDashboardController } from '../controllers/adminControllers/adminDashboard.Controller' 
import { InstructorMembershipOrder } from '../repositories/genericRepo/InstructorMemberShirpOrder.Repository' 

// =============================================================================
// STUDENT DASHBOARD IMPORTS
// Student dashboard with enrolled courses, bookings, and orders
// =============================================================================
import { IStudentDashboardRepository } from '../repositories/studentRepository/interfaces/IStudentDashboardRepository' 
import { StudentDashboardRepository } from '../repositories/studentRepository/studentDashboard.Repository'
import { IStudentDashboardService } from '../services/studentServices/interfaces/IStudentDashboardService' 
import { StudentDashboardService } from '../services/studentServices/StudentDashboard.Service' 
import { IStudentDashboardController } from '../controllers/studentControllers/interfaces/IStudentDashboardController'
import { StudentDashboardController } from "../controllers/studentControllers/studentDashboard.Controller";
import { BookingRepository } from '../repositories/genericRepo/Booking.Repository' 



// =============================================================================
// GENERIC REPOSITORY IMPORTS
// Reusable generic repository pattern for common database operations
// =============================================================================
import {
  GenericRepository,
  IGenericRepository,
} from '../repositories/genericRepo/generic.Repository'
import { OrderModel, IOrder } from '../models/order.Model'

// =============================================================================
// DEPENDENCY INJECTION SETUP
// Creating and configuring all application dependencies in the correct order
// Each step builds upon the previous ones to satisfy dependency requirements
// =============================================================================

/**
 * STEP 1: CREATE BASE SERVICES
 * Initialize core services that don't depend on other business logic services
 * These services are used across multiple modules throughout the application
 */

// OTP service for secure authentication across all user types
const otpRepository: IOtpRepository = new OtpRepository()
const otpService: IOtpServices = new OtpService(otpRepository)

/**
 * STEP 2: CREATE STUDENT CORE MODULE
 * Set up student authentication and basic operations
 * Student controller uses both student service for user operations and OTP service for authentication
 */
const studentRepository: IStudentRepository = new StudentRepository()
const studentService: IStudentService = new StudentServices(studentRepository)
const studentController: IStudentController = new StudentController(studentService, otpService)

/**
 * STEP 3: CREATE INSTRUCTOR CORE MODULE
 * Set up instructor authentication and basic operations
 * Instructor controller uses both instructor service for user operations and OTP service for authentication
 */
const instructorRepository: IInstructorRepository = new InstructorRepository()
const instructorService: IInstructorService = new InstructorService(instructorRepository)
const instructorController: IInstructorController = new InstructorController(
  instructorService,
  otpService,
)

/**
 * STEP 4: CREATE ADMIN CORE MODULE
 * Admin uses a composite pattern with specialized repositories for different user types
 * Main admin repository combines user and instructor repositories for comprehensive management
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
 * Admin verification system for approving instructor applications and managing verification processes
 * Reuses instructor service to maintain consistency in verification logic across admin and instructor sides
 */
const adminVerificationRepository: IAdminVerificationRepository = new AdminVerificationRepository()
const adminVerificationService: IAdminVerificationService = new AdminVerificationService(
  adminVerificationRepository,
  instructorService, // Shared verification logic between admin and instructor modules
)
const adminVerificationController: IAdminVerificationController = new AdminVerificationController(
  adminVerificationService,
)

/**
 * STEP 6: CREATE INSTRUCTOR VERIFICATION MODULE
 * Instructor-side verification for submitting credentials and managing verification status
 * Independent verification logic specifically for instructor workflows and requirements
 */
const instructorVerificationRepository: IInstructorVerificationRepository =
  new InstructorVerificationRepository()
const instructorVerificationService: IInstructorVerificationService =
  new InstructorVerificationService(instructorVerificationRepository)
const instructorVerificationController: IInstructorVerificationController =
  new InstructorVerificationController(instructorVerificationService)

/**
 * STEP 7: CREATE STUDENT PROFILE MODULE
 * Student profile management for personal information, preferences, and account settings
 * Provides students with functionality to update and maintain their profile information
 */
const studentProfileRepo: IStudentProfileRepository = new studentProfileRepository()
const studentProfileService: IStudentProfileService = new StudentProfileService(studentProfileRepo)
const studentProfileController: IStudentProfileController = new StudentProfileController(
  studentProfileService,
)

/**
 * STEP 8: CREATE INSTRUCTOR PROFILE MODULE
 * Instructor profile management for professional information, bio, and qualifications
 * Allows instructors to showcase their expertise and build credibility with students
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
 * Category management system for admins to create, organize, and maintain course categories
 * Provides hierarchical categorization for better course organization and discovery
 */
const adminCategoryRepository: IAdminCategoryRepository = new AdminCategoryRepository()
const adminCategoryServie: IAdminCategoryService = new AdminCategoryService(adminCategoryRepository)
const adminCategoryController: IAdminCategoryController = new AdminCategoryContoller(
  adminCategoryServie,
)

/**
 * STEP 10: CREATE INSTRUCTOR CATEGORY MODULE
 * Category browsing for instructors to select appropriate categories when creating courses
 * Provides read-only access to category hierarchy for course classification
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
 * Chapter management for organizing course content into structured learning units
 * Allows instructors to create, edit, and sequence educational content effectively
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
 * Quiz creation and management for course assessments and student evaluation
 * Enables instructors to create interactive assessments and track student progress
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
 * Comprehensive course management combining chapters and quizzes for complete course creation
 * Aggregates chapter and quiz functionality to provide full course authoring capabilities
 */
const instructorCourseRepository: IInstructorCourseRepository = new InstructorCourseRepository()
const instructorCourseService: IInstructorCourseService = new InstructorCourseService(
  instructorCourseRepository,
  instructorChapterRepository, // Integrates chapter management for course content
  instructorQuizRepository, // Integrates quiz management for course assessments
)
const instructorCourseController: IInstructorCourseController = new InstructorCourseController(
  instructorCourseService,
)

/**
 * STEP 14: CREATE ADMIN COURSE MODULE
 * Admin course oversight including approval, monitoring, and quality control
 * Uses generic repositories for comprehensive course data access and management
 */
const adminCourseRepository: IAdminCourseRepository = new AdminCourseRepository(
  new ChapterDetailRepository(),
  new QuizDetailRepository(),
)
const adminCourseService: IAdminCourseService = new AdminCourseService(adminCourseRepository)
const adminCourseController: IAdminCourseController = new AdminCourseController(adminCourseService)

/**
 * STEP 15: CREATE STUDENT COURSE MODULE
 * Student course consumption with read-only access to content and progress tracking
 * Provides secure content delivery while preventing unauthorized modifications
 */
const chapterReadOnlyRepository: IChapterReadOnlyRepository = new ChapterReadOnlyRepository()
const quizReadOnlyRepository: IQuizReadOnlyRepository = new QuizReadOnlyRepository()
const studentCourseRepository: IStudentCourseRepository = new StudentCourseRepository(
  chapterReadOnlyRepository, // Read-only chapter access for content consumption
  quizReadOnlyRepository, // Read-only quiz access for taking assessments
)
const studentCourseService: IStudentCourseService = new StudentCourseService(
  studentCourseRepository,
)
const studentCourseController: IStudentCourseController = new StudentCourseController(
  studentCourseService,
)

/**
 * STEP 16: CREATE STUDENT CATEGORY BROWSING MODULE
 * Category browsing functionality for students to discover courses by topic
 * Provides filtered course discovery and improved user experience for course selection
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
 * Shopping cart functionality for managing courses before purchase
 * Allows students to add multiple courses and manage their selections before checkout
 */
const studentCartRepository: IStudentCartRepository = new StudentCartRepository()
const studentCartService: IStudentCartService = new StudentCartService(studentCartRepository)
const studentCartController: IStudentCartController = new StudentCartController(studentCartService)

/**
 * STEP 18: CREATE STUDENT WISHLIST MODULE
 * Wishlist functionality for saving courses for future consideration
 * Provides students with a way to bookmark interesting courses and access them easily later
 */
const studentWishlistRepository: IStudentWishlistRepository = new StudentWishlistRepository()
const studentWishlistService: IStudentWishlistService = new StudentWishlistService(
  studentWishlistRepository,
)
const studentWishlistController: IStudentWishlistController = new StudentWishlistController(
  studentWishlistService,
)

/**
 * STEP 19: CREATE WALLET SYSTEM
 * Digital wallet functionality for managing user balances and financial transactions
 * Central wallet service used across student, instructor, and admin modules for consistent financial operations
 */
const walletRepository: IWalletRepository = new WalletRepository()
const walletService: IWalletService = new WalletService(walletRepository, adminRepository)

/**
 * STEP 20: CREATE STUDENT CHECKOUT MODULE
 * Complete checkout process including payment processing, order creation, and course enrollment
 * Integrates cart functionality with payment processing and automatic course enrollment upon successful payment
 */
const studentCheckoutRepository: IStudentCheckoutRepository = new StudentCheckoutRepository(
  new OrderRepository(),
  new PaymentRepository(),
  new EnrollmentRepository(),
  new CourseRepository(),
)
const studentCheckoutService: IStudentCheckoutService = new StudentCheckoutService(
  studentCheckoutRepository,
  studentCartRepository,
  walletService,
)
const studentCheckoutController: IStudentCheckoutController = new StudentCheckoutController(
  studentCheckoutService,
)

/**
 * STEP 21: CREATE INSTRUCTOR DASHBOARD SYSTEM
 * Analytics dashboard for instructors to track overall course performance and earnings
 * Uses generic order repository to aggregate data across all instructor courses
 */
const orderRepo: IGenericRepository<IOrder> = new GenericRepository<IOrder>(OrderModel)

const instructorDashboardRepo: IInstructorAllCourseDashboardRepository =
  new InstructorAllCourseDashboardRepository(orderRepo)

const instructorDashboardService: IInstructorAllCourseDashboardService =
  new InstructorAllCourseDashboardService(instructorDashboardRepo)

const instructorDashboardController: IInstructorAllDashboardController =
  new InstructorAllCourseDashboardController(instructorDashboardService)

/**
 * STEP 22: CREATE COURSE-SPECIFIC DASHBOARD SYSTEM
 * Detailed analytics for individual courses including enrollment metrics and student progress
 * Provides granular insights into specific course performance and student engagement
 */
const specificCourseDahboardRepository: IInstructorCourseSpecificDashboardRepository =
  new InstructorSpecificCourseDashboardRepository(
    new PaymentRepository(),
    new EnrollmentRepository(),
    new CourseRepository(),
    new OrderRepository(),
  )

const specificCourseDashboardService: IInstructorSpecificCourseDashboardService =
  new InstructorSpecificCourseDashboardService(specificCourseDahboardRepository)

const specificCourseDashboardController: IInstructorCourseSpecificDashboardController =
  new InstructorSpecificCourseDashboardController(specificCourseDashboardService)

/**
 * STEP 23: CREATE STUDENT ENROLLMENT TRACKING MODULE
 * Student enrollment history and course access management
 * Tracks which courses students have enrolled in and manages their access permissions
 */
const studentEnrollmentRepository: IStudentEnrollmentRepository = new StudentEnrollmentRepository(
  studentRepository,
  instructorRepository,
)

const studentEnrollmentService: IStudentEnrollmentService = new StudentEnrollmentService(
  studentEnrollmentRepository,
)

const studentEnrollmentController: IStudentEnrollmentController = new StudentEnrollmentController(
  studentEnrollmentService,
)

/**
 * STEP 24: CREATE STUDENT WALLET MANAGEMENT MODULE
 * Student-specific wallet operations including balance viewing and transaction history
 * Provides students with interface to manage their digital wallet and view spending history
 */
const studentWalletController: IStudentWalletController = new StudentWalletController(walletService)

/**
 * STEP 25: CREATE WALLET PAYMENT SYSTEM
 * Payment processing through digital wallet including top-ups and course purchases
 * Handles all wallet-based financial transactions with proper validation and security
 */
const walletPaymentRepository: IWalletPaymentRepository = new WalletPaymentRepository()
const walletPaymentService: IWalletPaymentService = new WalletPaymentService(
  walletPaymentRepository,
  walletService,
)
const studentWalletPaymentController: IWalletPaymentController = new StudentWalletPaymentController(
  walletPaymentService,
)

/**
 * STEP 26: CREATE INSTRUCTOR WALLET MANAGEMENT MODULE
 * Instructor earnings management and wallet operations for course revenue tracking
 * Provides instructors with visibility into their earnings and wallet balance
 */
const instructorWalletController: IInstructorWalletController = new InstructorWalletController(
  walletService,
)

/**
 * STEP 27: CREATE INSTRUCTOR WALLET PAYMENT MODULE
 * Payment processing for instructor earnings including withdrawal capabilities
 * Handles instructor-specific wallet operations and withdrawal request processing
 */
const instructorWalletPaymentController: IInstructorWalletPaymentController =
  new InstructorWalletPaymentController(walletPaymentService)

/**
 * STEP 28: CREATE ADMIN WALLET MANAGEMENT MODULE
 * Admin oversight of all wallet operations and comprehensive transaction monitoring
 * Provides administrators with system-wide financial oversight and control capabilities
 */
const adminWalletController: IAdminWalletController = new AdminWalletController(walletService)

/**
 * STEP 29: CREATE ADMIN WALLET PAYMENT MODULE
 * Admin control over payment processing and transaction approval workflows
 * Enables administrators to oversee and manage all financial transactions in the system
 */
const adminWalletPaymentController: IAdminWalletPaymentController =
  new AdminWalletPaymentController(walletPaymentService)

/**
 * STEP 30: CREATE WITHDRAWAL REQUEST SYSTEM
 * Instructor withdrawal requests and admin approval workflow for earnings management
 * Handles the complete workflow from instructor withdrawal request to admin approval and processing
 */
const withdrawalRepo: IWithdrawalRequestRepository = new WithdrawalRequestRepository()

const withdrawalService: IWithdrawalRequestService = new WithdrawalRequestService(
  withdrawalRepo,
  walletService,
  instructorRepository,
)

const instructorWithdrawalController: IInstructorWithdrawalController =
  new InstructorWithdrawalController(withdrawalService)

/**
 * STEP 31: CREATE ADMIN WITHDRAWAL MANAGEMENT MODULE
 * Admin interface for processing and approving instructor withdrawal requests
 * Provides administrators with tools to review, approve, or reject withdrawal requests
 */
const adminWithdrawalController: IAdminWithdrawalController = new AdminWithdrawalController(
  withdrawalService,
)

/**
 * STEP 32: CREATE STUDENT ORDER HISTORY MODULE
 * Student purchase history and order tracking functionality for transaction records
 * Allows students to view their complete purchase history and track order status
 */
const studentOrderRepository: IStudentOrderRepository = new StudentOrderRepository()

const studentOrderService: IStudentOrderService = new StudentOrderService(studentOrderRepository)
const studentOrderController: IStudentOrderController = new StudentOrderController(
  studentOrderService,
)




/**
 * STEP 33: CREATE ADMIN MEMBERSHIP MANAGEMENT MODULE
 */
const adminMembershipRepository: IAdminMembershipRepository = new AdminMembershipRepository()
const adminMembershipService: IAdminMembershipService = new AdminMembershipService(adminMembershipRepository)
const adminMembershipController: IAdminMembershipController = new AdminMembershipController(adminMembershipService)

/**
 * STEP 34: CREATE INSTRUCTOR MEMBERSHIP MANAGEMENT MODULE
 */
const instructorMembershipRepository: IInstructorMembershipRepository = new InstructorMembershipRepository()
const instructorMembershipService: IInstructorMembershipService = new InstructorMembershipService(instructorMembershipRepository, instructorRepository)
const instructorMembershipController: IInstructorMembershipController = new InstructorMembershipController(instructorMembershipService)

/**
 * STEP 35: CREATE INSTRUCTOR MEMBERSHIP ORDER MODULE
 */
const emailService: IEmail = new SendEmail()
const instructorMembershipOrderRepository: IInstructorMembershipOrderRepository = new InstructorMembershipOrderRepository()
const instructorMembershipOrderService: IInstructorMembershipOrderService = new InstructorMembershipOrderService(
  instructorMembershipOrderRepository,
  instructorMembershipRepository,
  instructorRepository,
  razorpay,
  walletService,
  emailService
)
const instructorMembershipOrderController: IInstructorMembershipOrderController = new InstructorMembershipOrderController(
  instructorMembershipOrderService,
  instructorMembershipService
)

/**
 * STEP 36: CREATE ADMIN MEMBERSHIP ORDER MODULE
 */
const adminMembershipOrderRepository: IAdminMembershipOrderRepository = new AdminMembershipOrderRepository()
const adminMembershipOrderService: IAdminMembershipOrderService = new AdminMembershipOrderService(adminMembershipOrderRepository)
const adminMembershipOrderController: IAdminMembershipOrderController = new AdminMembershipOrderController(adminMembershipOrderService)

/**
 * STEP 37: CREATE INSTRUCTOR SLOT MANAGEMENT MODULE
 */
const instructorSlotRepository: IInstructorSlotRepository = new InstructorSlotRepository()
const instructorSlotService: IInstructorSlotService = new InstructorSlotService(instructorSlotRepository)
const instructorSlotController: IInstructorSlotController = new InstructorSlotController(instructorSlotService)

/**
 * STEP 38: CREATE STUDENT INSTRUCTOR LISTING MODULE
 */
const studentInstructorListingRepository: IStudentInstructorListingRepository = new StudentInstructorListingRepository()
const studentInstructorListingService: IStudentInstructorListingService = new StudentInstructorListingService(studentInstructorListingRepository)
const studentInstructorListingController: IStudentInstructorListingController = new StudentInstructorListingController(studentInstructorListingService)

/**
 * STEP 39: CREATE STUDENT SLOT VIEWING MODULE
 */
const studentSlotRepository: IStudentSlotRepository = new StudentSlotRepository()
const studentSlotService: IStudentSlotService = new StudentSlotService(studentSlotRepository)
const studentSlotController: IStudentSlotController = new StudentSlotController(studentSlotService)

/**
 * STEP 40: CREATE STUDENT SLOT BOOKING MODULE
 */
const studentSlotBookingRepository: IStudentSlotBookingRepository = new StudentSlotBookingRepository()
const studentSlotBookingService: IStudentSlotBookingService = new StudentSlotBookingService(studentSlotBookingRepository, studentSlotRepository, walletService)
const studentSlotBookingController: IStudentSlotBookingController = new StudentSlotBookingController(studentSlotBookingService)

/**
 * STEP 41: CREATE INSTRUCTOR BOOKED SLOT MODULE
 */
const instructorSlotBookingRepository: IInstructorSlotBookingRepository = new InstructorSlotBookingRepository()
const instructorSlotBookingService: IInstructorSlotBookingService = new InstructorSlotBookingService(instructorSlotBookingRepository)
const instructorSlotBookingController: IInstructorSlotBookingController = new InstructorSlotBookingController(instructorSlotBookingService)

/**
 * STEP 42: CREATE ADMIN DASHBOARD MODULE
 */
const adminDashboardRepository: IAdminDashboardRepository = new AdminDashboardRepository(
  instructorRepository,
  new CourseRepository(),
  new OrderRepository(),
  new InstructorMembershipOrder()
)
const adminDashboardService: IAdminDashboardService = new AdminDashboardService(adminDashboardRepository)
const adminDashboardController: IAdminDashboardController = new AdminDashboardController(adminDashboardService)

/**
 * STEP 43: CREATE STUDENT DASHBOARD MODULE
 */
const studentDashboardRepository: IStudentDashboardRepository = new StudentDashboardRepository(
  new EnrollmentRepository(),
  new BookingRepository(),
  new OrderRepository()
)
const studentDashboardService: IStudentDashboardService = new StudentDashboardService(studentDashboardRepository)
const studentDashboardController: IStudentDashboardController = new StudentDashboardController(studentDashboardService)


// =============================================================================
// CONTROLLER EXPORTS
// Export all configured controllers for use in route handlers throughout the application
// Controllers are organized by domain and functionality for easy maintenance and understanding
// =============================================================================

/**
 * Export all controllers that serve as entry points for HTTP request handling
 * Each controller is fully configured with its required dependencies and ready for use
 *
 * Controllers are grouped by functionality:
 * - User Management: Core authentication and user operations
 * - Verification Systems: User verification and approval workflows
 * - Profile Management: User profile and information management
 * - Content Management: Course, chapter, quiz, and category operations
 * - Student Features: Cart, wishlist, enrollment, and course consumption
 * - Financial Systems: Wallet, payments, orders, and withdrawal management
 * - Analytics: Dashboard and reporting functionality
 */
export {
  // =============================================================================
  // CORE USER MANAGEMENT CONTROLLERS
  // Authentication, registration, and core account operations
  // =============================================================================
  studentController, // Student login, registration, and account operations
  instructorController, // Instructor login, registration, and account operations
  adminController, // Admin operations and user management

  // =============================================================================
  // VERIFICATION WORKFLOW CONTROLLERS
  // Manage application, approval, and verification flows
  // =============================================================================
  adminVerificationController, // Admin review and approval of applications
  instructorVerificationController, // Instructor credential submission and verification status

  // =============================================================================
  // PROFILE MANAGEMENT CONTROLLERS
  // Handle profile creation, update, and settings
  // =============================================================================
  studentProfileController, // Student profile (bio, preferences, settings)
  instructorProfileController, // Instructor profile (qualifications, bio, experience)

  // =============================================================================
  // CONTENT MANAGEMENT CONTROLLERS
  // Creation, organization, and management of educational content
  // =============================================================================
  adminCategoryController, // Admin: create/edit/manage course categories
  instructorCategoryController, // Instructor: select categories for courses
  instructorChapterController, // Instructor: manage course chapters
  instructorQuizController, // Instructor: create/manage quizzes and assessments
  instructorCourseController, // Instructor: complete course creation & management
  adminCourseController, // Admin: monitor, approve, and manage all courses

  // =============================================================================
  // STUDENT LEARNING CONTROLLERS
  // Handle discovery, enrollment, and consumption of courses
  // =============================================================================
  studentCourseController, // Student: consume course content (videos, quizzes)
  categoryReadOnlyController, // Student: browse categories for discovery
  studentCartController, // Student: shopping cart for course checkout
  studentWishlistController, // Student: wishlist to save courses
  studentCheckoutController, // Student: checkout & purchase processing

  // =============================================================================
  // ANALYTICS & REPORTING CONTROLLERS
  // Provide performance tracking and insights
  // =============================================================================
  instructorDashboardController, // Instructor: overall analytics (earnings, performance)
  specificCourseDashboardController, // Course-specific analytics (enrollment, revenue, etc.)
  adminDashboardController, // Admin: global platform insights (courses, orders, memberships)
  studentDashboardController, // Student: personal learning & booking dashboard

  // =============================================================================
  // STUDENT ACCOUNT MANAGEMENT CONTROLLERS
  // Manage enrollment history and orders
  // =============================================================================
  studentEnrollmentController, // Student: track enrolled courses & access history
  studentOrderController, // Student: view past orders & transactions

  // =============================================================================
  // FINANCIAL MANAGEMENT CONTROLLERS
  // Handle wallets, payments, and transactions
  // =============================================================================
  studentWalletController, // Student wallet: balance & transaction history
  studentWalletPaymentController, // Student wallet payments (add funds, purchases)
  instructorWalletController, // Instructor wallet: earnings & revenue
  instructorWalletPaymentController, // Instructor payments: payouts & transactions
  adminWalletController, // Admin: oversee all wallet operations
  adminWalletPaymentController, // Admin: control platform-wide payment flows

  // =============================================================================
  // WITHDRAWAL MANAGEMENT CONTROLLERS
  // Manage instructor withdrawal requests and admin approvals
  // =============================================================================
  instructorWithdrawalController, // Instructor withdrawal requests (submit & track)
  adminWithdrawalController, // Admin processes withdrawal approvals/rejections

  // =============================================================================
  // MEMBERSHIP MANAGEMENT CONTROLLERS
  // Handle admin & instructor memberships and orders
  // =============================================================================
  adminMembershipController, // Admin membership management
  instructorMembershipController, // Instructor membership management
  instructorMembershipOrderController, // Instructor membership purchase/checkout
  adminMembershipOrderController, // Admin membership order monitoring

  // =============================================================================
  // SLOT MANAGEMENT CONTROLLERS
  // Manage instructor availability and student booking
  // =============================================================================
  instructorSlotController, // Instructor creates and manages availability slots
  instructorSlotBookingController, // Instructor views and manages booked slots
  studentSlotController, // Student views available slots
  studentSlotBookingController, // Student books slots with wallet/payment flow

  // =============================================================================
  // STUDENT-INSTRUCTOR DISCOVERY CONTROLLERS
  // Enable students to discover and connect with instructors
  // =============================================================================
  studentInstructorListingController, // Student: browse/search instructor listings
}
