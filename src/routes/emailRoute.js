import express from 'express'
import content from '../middlewares/content.js'
import {
  sendRegisterVerificationCode,
  verifyVerificationCode,
  sendForgetPWDCode,
  // verifyForgetPWDCode
} from '../controllers/emailController.js'

const router = express.Router()

router.post('/registerVerificationCode/send', content('application/json'), sendRegisterVerificationCode)
router.post('/registerVerificationCode/verify', content('application/json'), verifyVerificationCode("register", false))
router.post('/forgetPWDCode/send', content('application/json'), sendForgetPWDCode)
// router.post('/forgetPWDCode/verify', content('application/json'), verifyForgetPWDCode(false))
export default router;