import { Router } from 'express'
import {
  adminController,
  adminVerificationController,
  adminCategoryController,
  adminCourseController,
} from '../core/container'
import authenticateToken from '../middlewares/AuthenticatedRoutes'

import { isAdmin } from '../middlewares/roleAuth'

let router = Router()

router.post('/login', adminController.login.bind(adminController))
router.post('/logout', adminController.logout.bind(adminController))

//get all users and instructors
router.get(
  '/getAllUsers',
  authenticateToken,
  isAdmin,
  adminController.getAllUsers.bind(adminController),
)
router.get(
  '/getAllInstructors',
  authenticateToken,
  isAdmin,
  adminController.getAllInstructors.bind(adminController),
)

//block or unblock
router.get(
  '/blockUser/:email',
  authenticateToken,
  isAdmin,
  adminController.blockUser.bind(adminController),
)
router.get(
  '/blockInstructor/:email',
  authenticateToken,
  isAdmin,
  adminController.blockInstructor.bind(adminController),
)

//verification  routes
router.get(
  '/request/:email',
  isAdmin,
  adminVerificationController.getRequestData.bind(adminVerificationController),
)

router.get(
  '/requests',
  isAdmin,
  adminVerificationController.getAllRequests.bind(adminVerificationController),
)

router.post(
  '/approveRequest',
  isAdmin,
  adminVerificationController.approveRequest.bind(adminVerificationController),
)


// category routes

router.get('/categories',authenticateToken,isAdmin,adminCategoryController.getAllCategory.bind(adminCategoryController))

router.get('/category/:categoryId',authenticateToken,isAdmin,adminCategoryController.findCategoryById.bind(adminCategoryController))

router.put('/categoryListOrUnlist/:id',authenticateToken,isAdmin,adminCategoryController.listOrUnlistCategory.bind(adminCategoryController))

router.post('/category',authenticateToken,isAdmin,adminCategoryController.addCategory.bind(adminCategoryController))

router.put('/category',authenticateToken,isAdmin,adminCategoryController.editCategory.bind(adminCategoryController))

//Course management
//Course management

router.get(
  "/courses",
  authenticateToken,
  isAdmin,
  adminCourseController.getAllCourses.bind(adminCourseController)
);

router.get(
  "/courses/:courseId",
  authenticateToken,
  isAdmin,
  adminCourseController.getCourseDetails.bind(adminCourseController)
)

router.patch(
  "/courses/:courseId/listing",
  authenticateToken,
  isAdmin,
  adminCourseController.updateListingStatus.bind(adminCourseController)
);

router.patch(
  "/courses/:courseId/verifyCourse",
  authenticateToken,
  isAdmin,
  adminCourseController.toggleVerificationStatus.bind(adminCourseController)
)


const adminRoutes = router

export default adminRoutes
