
import anValidator from 'an-validator';
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js'
import emailService from '../services/emailService.js'
import userService from '../services/userService.js'

//email在驗證碼就檢查完，所以這邊不用再檢查了
const { rules, validateByRules } = anValidator;

export const validateResetPWDReq = async (req, res, next) => {
  const { names, articleId, content } = req.body;
  if (!content) {
    throw new ValidationObjectError("validationError");
  }
  await validateBoardCreateReqName(names)
  //確認申請人為作者+不可申請過
  const email = await emailService.getEmailByName(req.body.email, "user");
  if(!email){

  }
  const user = await userService.findOneUser(req.user._id, ['password', 'account'])
  if (theArticle.user.toString() !== req.user._id.toString()) throw new ValidationObjectError("notAuthor")
  req.article = theArticle
  next()
}