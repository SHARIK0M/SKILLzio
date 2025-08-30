// =======================
// User Router Endpoints
// =======================

// This object contains all the API endpoint paths
// related to student (user) functionalities in the system.

const UserRouterEndpoints = {
  // ---------------- Profile Management ----------------
  userProfilePage: "/api/student/profile", // Get student profile
  userUpdateProfile: "/api/student/profile", // Update student profile
  userUpdatePassWord: "/api/student/profile/password", // Update/change password

  // ---------------- Course Management ----------------
  userCourseList: "/api/student/courses", // Get all courses available
  userCourseDetail: "/api/student/courses", // Get details of a specific course
  userCourseFilter: "/api/student/courses/filter", // Get filtered course list

  // ---------------- Categories ----------------
  userGetAllCategories: "/api/student/categories", // Get all categories for browsing courses

  // ---------------- Cart Management ----------------
  userGetCart: "/api/student/cart", // Get all courses in the cart
  userAddToCart: "/api/student/addToCart", // Add a course to the cart
  userRemoveCourseFromCart: "/api/student/remove", // Remove a course from the cart
  userClearCart: "/api/student/clearCart", // Clear entire cart

  // ---------------- Wishlist Management ----------------
  userGetWishlist: "/api/student/wishlist", // Get wishlist courses
  userAddTowishlist: "/api/student/addToWishlist", // Add course to wishlist
  userRemoveWishlist: "/api/student/removeWishlistCourse", // Remove course from wishlist
  userCheckCourseExistInWishlist: "/api/student/check", // Check if course exists in wishlist

  // ---------------- Checkout ----------------
  userInitiateCheckout: "/api/student/checkout", // Start the checkout process
  userCompleteCheckout: "/api/student/complete", // Complete the checkout after payment

  // ---------------- Enrollment ----------------
  userGetEnrolledCourses: "/api/student/enrolled", // Get all enrolled courses
  userGetSpecificEnrolledCourses: "/api/student/enrolled", // Get details of specific enrolled course
  userMarkChapterCompleted: "/api/student/enrolled/completeChapter", // Mark a chapter as completed
  userSubmitQuiz: "/api/student/submitQuiz", // Submit quiz for a course
  userCheckAllChapterCompleted: "/api/student/enrollment", // Check if all chapters are completed
  userGetCertificate: "/api/student/certificate", // Download/Fetch certificate after completion

  // ---------------- Wallet Management ----------------
  userGetWallet: "/api/student/wallet", // Get wallet balance
  userCreditWallet: "/api/student/wallet/credit", // Credit amount to wallet
  userDebitWallet: "/api/student/wallet/debit", // Debit amount from wallet
  userGetTransactions: "/api/student/wallet/transactions", // Get wallet transactions

  userCreateOrderForWalletCredit: "/api/student/wallet/payment/createOrder", // Create wallet credit order
  userVerifyPayment: "/api/student/wallet/payment/verify", // Verify wallet payment

  // ---------------- Orders ----------------
  userGetOrders: "/api/student/orders", // Get all orders
  userGetOrderDetail: "/api/student/orders", // Get details of a specific order
  userDownloadOrderInvoice: "/api/student/orders", // Download invoice for a specific order

  //student side instructor listing

  userSideInstructorLists: "/api/student/instructors",
  userSideInstructorDetailsById: "/api/student/instructors",
  userGetSkillsAndExpertise: "/api/student/instructors/filters",

  //viewing slots availability for the particular instructor

  userViewSlotsParticularInstructor: "/api/student/slots",

  //slot booking related routes

  userSlotInitiateCheckout: "/api/student/checkout",
  userSlotVerifyPayment: "/api/student/verifySlotPayment",
  userBookSlotViaWallet: "/api/student/wallet",
  userGetSlotBookingHistory: "/api/student/bookingHistory",
  userGetSpecificSlotDetail: "/api/student/booking",
  userDownloadSlotReceipt: "/api/student/booking",

  //student dashboard

  userDashboard: "/api/student/dashboard",
  userCourseReport: "/api/student/dashboard/courseReport",
  userSlotReport: "/api/student/dashboard/slotReport",
  userExportCourseReport: "/api/student/dashboard/exportCourseReport",
  userExportSlotReport: "/api/student/dashboard/exportSlotReport",
};

export default UserRouterEndpoints;
