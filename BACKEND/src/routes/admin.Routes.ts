import { Router } from 'express'
import {
  adminController,
  adminVerificationController,
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


const adminRoutes = router

export default adminRoutes
