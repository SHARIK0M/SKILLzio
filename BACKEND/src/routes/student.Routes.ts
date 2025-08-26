import { Router } from 'express'
import { studentController } from '../core/container'
import upload from '../utils/multer'
import authenticateToken from '../middlewares/AuthenticatedRoutes'
import { isStudent } from '../middlewares/roleAuth'
import {
  studentProfileController,
  studentCourseController,
  categoryReadOnlyController,
  studentCartController,
  studentWishlistController,
} from '../core/container'


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



router.get('/courses',studentCourseController.getAllCourses.bind(studentCourseController))

router.get('/courses/filter',studentCourseController.getFilteredCourses.bind(studentCourseController))

router.get('/courses/:courseId',studentCourseController.getCourseDetails.bind(studentCourseController))

router.get('/categories',categoryReadOnlyController.getAllCategories.bind(categoryReadOnlyController))





router.get("/cart",authenticateToken,isStudent,studentCartController.getCart.bind(studentCartController))

router.post('/addToCart',authenticateToken,isStudent,studentCartController.addToCart.bind(studentCartController))

router.delete('/remove/:courseId',authenticateToken,isStudent,studentCartController.removeFromCart.bind(studentCartController))

router.delete("/clearCart",authenticateToken,isStudent,studentCartController.clearCart.bind(studentCartController))



router.post('/addToWishlist',authenticateToken,isStudent,studentWishlistController.addToWishlist.bind(studentWishlistController))

router.delete('/removeWishlistCourse/:courseId',authenticateToken,isStudent,studentWishlistController.removeFromWishlist.bind(studentWishlistController))

router.get('/wishlist',authenticateToken,isStudent,studentWishlistController.getWishlistCourses.bind(studentWishlistController))

router.get('/check/:courseId',authenticateToken,isStudent,studentWishlistController.isCourseInWishlist.bind(studentWishlistController))


export default router
