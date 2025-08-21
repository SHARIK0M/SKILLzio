import { Router } from 'express'
import { studentController } from '../core/container'
import upload from '../utils/multer'
import authenticateToken from '../middlewares/AuthenticatedRoutes'
import { isStudent } from '../middlewares/roleAuth'
import { studentProfileController } from '../core/container'


const router = Router()

router.post('/signUp', studentController.studentSignUp.bind(studentController))

router.post('/resendOtp', studentController.resendOtp.bind(studentController))

router.post('/createUser', studentController.createUser.bind(studentController))

router.post('/login', studentController.login.bind(studentController))

router.post('/logout', studentController.logout.bind(studentController))

router.post('/verifyEmail', studentController.verifyEmail.bind(studentController))

router.post('/verifyResetOtp', studentController.verifyResetOtp.bind(studentController))

router.post('/forgotResendOtp', studentController.forgotResendOtp.bind(studentController))

router.post('/resetPassword', studentController.resetPassword.bind(studentController))

router.post('/googleLogin', studentController.doGoogleLogin.bind(studentController))

router.get('/statusCheck', studentController.statusCheck.bind(studentController))

// Student Profile

router.get(
  '/profile',
  authenticateToken,
  isStudent,
  studentProfileController.getProfile.bind(studentProfileController),
)

router.put(
  '/profile',
  authenticateToken,
  isStudent,
  upload.single('profilePic'),
  studentProfileController.updateProfile.bind(studentProfileController),
)

router.put(
  '/profile/password',
  authenticateToken,
  isStudent,
  studentProfileController.updatePassword.bind(studentProfileController),
)

export default router
