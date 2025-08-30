// Define all API endpoint paths used for admin-related operations
const AdminRoutersEndPoints = {
  // User Management
  adminGetUsers: "/api/admin/getAllUsers", // Fetch all users
  adminBlockUser: "/api/admin/blockUser", // Block or unblock a specific user

  // Instructor Management
  adminGetInstructors: "/api/admin/getAllInstructors", // Fetch all instructors
  adminBlockInstructor: "/api/admin/blockInstructor", // Block or unblock a specific instructor

  // Instructor Verification Management
  adminGetVerifcationsRequest: "/api/admin/requests", // Fetch all pending verification requests
  adminGetVerificationByEamil: "/api/admin/request", // Fetch a specific verification request by email
  adminApproveVerification: "/api/admin/approveRequest", // Approve an instructor’s verification request

  //category
  adminGetAllCategories: "/api/admin/categories",
  adminGetCategoryById: "/api/admin/category",
  adminListOrUnListCategory: "/api/admin/categoryListOrUnList",
  adminCreateCategory: "/api/admin/category",
  adminEditCategory: "/api/admin/category",
  //course
  //course
  adminGetCourses: "/api/admin/courses",
  adminGetCourseDetail: "/api/admin/courses",
  adminToggleList: "/api/admin/courses",
  adminVerifyCourse: "/api/admin/courses",

  //wallet
  adminGetWallet: "/api/admin/wallet",
  adminCreditWallet: "/api/admin/wallet/credit",
  adminDebitWallet: "/api/admin/wallet/debit",
  adminWalletTransactions: "/api/admin/wallet/transactions",

  //wallet payment
  adminCreateOrderForWalletCredit: "/api/admin/wallet/payment/createOrder",
  adminVerifyPayment: "/api/admin/wallet/payment/verify",

  //withdrawal
  adminGetAllWithdrawalRequests: "/api/admin/allWithdrawalRequests",
  adminWithdrawalPending: "/api/admin/withdrawalRequestPending",
  adminWithdrawalApprove: "/api/admin/withdrawalRequestApprove",
  adminWithdrawalReject: "/api/admin/withdrawalRequestReject",
  adminGetRequestDetails: "/api/admin/withdrawalRequest",

  //membership

  adminAddMembershipPlan: "/api/admin/membershipPlan",
  adminEditMembershipPlan: "/api/admin/membershipPlan",
  adminDeleteMembershipPlan: "/api/admin/membershipPlan",
  adminGetMembershipPlanById: "/api/admin/membershipPlan",
  adminGetAllMembeshipPlan: "/api/admin/membershipPlans",
  adminToggleMembershipPlan: "/api/admin/membershipPlan",

  //membership purchase history

  adminGetMembershipPurchaseHistory: "/api/admin/membershipPurchaseHistory",
  adminViewMembershipPuchaseHistoryDetail:
    "/api/admin/membershipPurchaseHistory",

  //admin dashbaord

  adminDashboard: "/api/admin/dashboard",
  adminCourseReport: "/api/admin/dashboard/courseSalesReport",
  adminMembershipReport: "/api/admin/dashboard/membershipSalesReport",
  adminExportReport: "/api/admin/dashboard/exportCourseReport",
  adminExportMembershipReport: "/api/admin/dashboard/exportMembershipReport",
};

// Export so it can be imported and used across the project
export default AdminRoutersEndPoints;
