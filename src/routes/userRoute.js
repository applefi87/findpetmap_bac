import express from 'express'
import * as auth from '../middlewares/auth.js'
import content from '../middlewares/content.js'
import { validateUserRegistration, validateUserUpdateInfo } from '../middlewares/validator/userValidator.js'
import {
  register,
  login,
  extend,
  logout,
  changePWD,
  resetPWD,
  getMyInfo,
  updateInfo
} from '../controllers/userController.js'
import {
  verifyVerificationCode
} from '../controllers/emailController.js'
// import { validateBadges } from '../middlewares/contentValidator.js'
const router = express.Router()


router.post('/register', content('application/json'), validateUserRegistration, verifyVerificationCode("register", true), register)
router.post('/login', content('application/json'), auth.login("_id nickname role password tokens safety.firstTryAt safety.nextTryAvailableAt safety.totalTryCount"), login)
router.delete('/logout', auth.jwt(""), logout)
router.get('/extend', auth.jwt("_id role tokens"), extend)

router.get('/getMyInfo', auth.jwt("info"), getMyInfo)
router.post('/updateInfo', content('application/json'), auth.jwt("info"), validateUserUpdateInfo, updateInfo)

router.post('/changePWD', content('application/json'), auth.jwt("password tokens safety.changePassword.totalTryCount"), changePWD)
router.post('/resetPWD', content('application/json'), verifyVerificationCode("forgetPWD", true), resetPWD)

export default router
