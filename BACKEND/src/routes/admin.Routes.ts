import { Router } from 'express'
import {
  adminController,
  adminVerificationController,
  adminCategoryController,
  adminCourseController,
  adminWalletController,
  adminWalletPaymentController,
  adminWithdrawalController,
  adminMembershipController,
  adminMembershipOrderController,
  adminDashboardController,
} from '../core/container'
import authenticateToken from '../middlewares/AuthenticatedRoutes'
import { isAdmin } from '../middlewares/roleAuth'

let router = Router()

// ------------------ Authentication ------------------
router.post('/login', adminController.login.bind(adminController)) // Admin login
router.post('/logout', adminController.logout.bind(adminController)) // Admin logout

// ------------------ User and Instructor Management ------------------
router.get(
  '/getAllUsers',
  authenticateToken,
  isAdmin,
  adminController.getAllUsers.bind(adminController), // Fetch all users
)
router.get(
  '/getAllInstructors',
  authenticateToken,
  isAdmin,
  adminController.getAllInstructors.bind(adminController), // Fetch all instructors
)

// Block or unblock users and instructors
router.get(
  '/blockUser/:email',
  authenticateToken,
  isAdmin,
  adminController.blockUser.bind(adminController), // Block or unblock a user
)
router.get(
  '/blockInstructor/:email',
  authenticateToken,
  isAdmin,
  adminController.blockInstructor.bind(adminController), // Block or unblock an instructor
)

// ------------------ Verification Management ------------------
router.get(
  '/request/:email',
  isAdmin,
  adminVerificationController.getRequestData.bind(adminVerificationController), // Get a specific verification request
)

router.get(
  '/requests',
  isAdmin,
  adminVerificationController.getAllRequests.bind(adminVerificationController), // Get all verification requests
)

router.post(
  '/approveRequest',
  isAdmin,
  adminVerificationController.approveRequest.bind(adminVerificationController), // Approve verification request
)

// ------------------ Category Management ------------------
router.get(
  '/categories',
  authenticateToken,
  isAdmin,
  adminCategoryController.getAllCategory.bind(adminCategoryController), // Get all categories
)

router.get(
  '/category/:categoryId',
  authenticateToken,
  isAdmin,
  adminCategoryController.findCategoryById.bind(adminCategoryController), // Get category by ID
)

router.put(
  '/categoryListOrUnlist/:id',
  authenticateToken,
  isAdmin,
  adminCategoryController.listOrUnlistCategory.bind(adminCategoryController), // List or unlist a category
)

router.post(
  '/category',
  authenticateToken,
  isAdmin,
  adminCategoryController.addCategory.bind(adminCategoryController), // Add new category
)

router.put(
  '/category',
  authenticateToken,
  isAdmin,
  adminCategoryController.editCategory.bind(adminCategoryController), // Edit category
)

// ------------------ Course Management ------------------
router.get(
  '/courses',
  authenticateToken,
  isAdmin,
  adminCourseController.getAllCourses.bind(adminCourseController), // Get all courses
)

router.get(
  '/courses/:courseId',
  authenticateToken,
  isAdmin,
  adminCourseController.getCourseDetails.bind(adminCourseController), // Get course details by ID
)

router.patch(
  '/courses/:courseId/listing',
  authenticateToken,
  isAdmin,
  adminCourseController.updateListingStatus.bind(adminCourseController), // Update course listing status
)

router.patch(
  '/courses/:courseId/verifyCourse',
  authenticateToken,
  isAdmin,
  adminCourseController.toggleVerificationStatus.bind(adminCourseController), // Toggle course verification status
)

// ------------------ Wallet Management ------------------
router.get(
  '/wallet',
  authenticateToken,
  isAdmin,
  adminWalletController.getWallet.bind(adminWalletController), // Get admin wallet details
)

router.post(
  '/wallet/credit',
  authenticateToken,
  isAdmin,
  adminWalletController.creditWallet.bind(adminWalletController), // Credit wallet
)

router.post(
  '/wallet/debit',
  authenticateToken,
  isAdmin,
  adminWalletController.debitWallet.bind(adminWalletController), // Debit wallet
)

router.get(
  '/wallet/transactions',
  authenticateToken,
  isAdmin,
  adminWalletController.getTransactions.bind(adminWalletController), // Get wallet transaction history
)

// ------------------ Wallet Payment Management ------------------
router.post(
  '/wallet/payment/createOrder',
  authenticateToken,
  isAdmin,
  adminWalletPaymentController.createOrder.bind(adminWalletPaymentController), // Create wallet payment order
)

router.post(
  '/wallet/payment/verify',
  authenticateToken,
  isAdmin,
  adminWalletPaymentController.verifyPayment.bind(adminWalletPaymentController), // Verify wallet payment
)

// ------------------ Withdrawal Management ------------------
router.get(
  '/allWithdrawalRequests',
  authenticateToken,
  isAdmin,
  adminWithdrawalController.getAllWithdrawalRequests.bind(adminWithdrawalController), // Get all withdrawal requests
)

router.get(
  '/withdrawalRequest/:requestId',
  authenticateToken,
  isAdmin,
  adminWithdrawalController.getWithdrawalRequestById.bind(adminWithdrawalController), // Get withdrawal request by ID
)

router.post(
  '/withdrawalRequestApprove',
  authenticateToken,
  isAdmin,
  adminWithdrawalController.approveWithdrawalRequest.bind(adminWithdrawalController), // Approve withdrawal request
)

router.post(
  '/withdrawalRequestReject',
  authenticateToken,
  isAdmin,
  adminWithdrawalController.rejectWithdrawalRequest.bind(adminWithdrawalController), // Reject withdrawal request
)

// ------------------ Membership Management ------------------
router.post(
  '/membershipPlan',
  authenticateToken,
  isAdmin,
  adminMembershipController.createPlan.bind(adminMembershipController), // Create membership plan
)

router.put(
  '/membershipPlan/:membershipId',
  authenticateToken,
  isAdmin,
  adminMembershipController.updatePlan.bind(adminMembershipController), // Update membership plan
)

router.delete(
  '/membershipPlan/:membershipId',
  authenticateToken,
  isAdmin,
  adminMembershipController.deletePlan.bind(adminMembershipController), // Delete membership plan
)

router.get(
  '/membershipPlan/:membershipId',
  authenticateToken,
  isAdmin,
  adminMembershipController.getPlanById.bind(adminMembershipController), // Get membership plan by ID
)

router.get(
  '/membershipPlans',
  authenticateToken,
  isAdmin,
  adminMembershipController.getAllPlans.bind(adminMembershipController), // Get all membership plans
)

router.patch(
  '/membershipPlan/:membershipId/toggleStatus',
  adminMembershipController.toggleStatus.bind(adminMembershipController), // Toggle membership plan status
)

// ------------------ Membership Purchase History ------------------
router.get(
  '/membershipPurchaseHistory',
  authenticateToken,
  isAdmin,
  adminMembershipOrderController.getAllOrders.bind(adminMembershipOrderController), // Get all membership purchase history
)

router.get(
  '/membershipPurchaseHistory/:txnId',
  authenticateToken,
  isAdmin,
  adminMembershipOrderController.getOrderDetail.bind(adminMembershipOrderController), // Get membership purchase detail by transaction ID
)

// ------------------ Dashboard Management ------------------
router.get(
  '/dashboard',
  authenticateToken,
  isAdmin,
  adminDashboardController.getDashboardData.bind(adminDashboardController), // Get dashboard data
)

router.get(
  '/dashboard/courseSalesReport',
  authenticateToken,
  isAdmin,
  adminDashboardController.getCourseSalesReport.bind(adminDashboardController), // Get course sales report
)

router.get(
  '/dashboard/membershipSalesReport',
  authenticateToken,
  isAdmin,
  adminDashboardController.getMembershipSalesReport.bind(adminDashboardController), // Get membership sales report
)

router.get(
  '/dashboard/exportCourseReport',
  authenticateToken,
  isAdmin,
  adminDashboardController.exportCourseSalesReport.bind(adminDashboardController), // Export course sales report
)

router.get(
  '/dashboard/exportMembershipReport',
  authenticateToken,
  isAdmin,
  adminDashboardController.exportMembershipSalesReport.bind(adminDashboardController), // Export membership sales report
)

// Export admin routes
const adminRoutes = router
export default adminRoutes
