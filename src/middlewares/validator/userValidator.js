
import anValidator from 'an-validator';
import User from '../../models/userModel.js'
import ValidationError from '../../infrastructure/errors/ValidationError.js'
import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js'
import emailService from '../../services/emailService.js'
import userService from '../../services/userService.js'
import * as userValidator from '../../utils/validator/userValidator.js'
import userConfigs from '../../infrastructure/configs/userConfigs.js';


const { rules, validateByRules } = anValidator;
//email在驗證碼就檢查完，所以這邊不用再檢查了

export const validateResetPWDReq = async (req, res, next) => {
  const { names, content } = req.body;
  if (!content) {
    throw new ValidationObjectError("validationError");
  }
  await validateBoardCreateReqName(names)
  //確認申請人為作者+不可申請過
  const email = await emailService.getEmailByName(req.body.email, "user");
  if (!email) {

  }
  await userService.findOneUser(req.user._id, ['password', 'account'])
  if (theArticle.user.toString() !== req.user._id.toString()) throw new ValidationObjectError("notAuthor")
  req.article = theArticle
  next()
}

const pwdMinLength = userConfigs.password.minLength
const pwdMaxLength = userConfigs.password.maxLength
const pwdType = userConfigs.password.pwdType
const accountMinLength = userConfigs.account.minLength
const accountMaxLength = userConfigs.account.maxLength
const nicknameMinLength = userConfigs.nickname.minLength
const nicknameMaxLength = userConfigs.nickname.maxLength

export const validateUserRegistration = async (req, res, next) => {
  const { password, account, nickname, info } = req.body
  const { name, phone, lineId, others } = (info || {})
  const mustInputFields = { password, account, nickname, name, phone };
  validAllFieldsPresent(mustInputFields)
  //basic validation
  const accountValidateResult = validateByRules(account, rules.createAccountRules(accountMinLength, accountMaxLength))
  if (!accountValidateResult.success) throw new ValidationObjectError("userAccountBetween", { min: accountMinLength, max: accountMaxLength });
  const nicknameValidateResult = validateByRules(nickname, rules.createNicknameRules(nicknameMinLength, nicknameMaxLength))
  if (!nicknameValidateResult.success) throw new ValidationObjectError("userNicknameBetween", { min: nicknameMinLength, max: nicknameMaxLength });
  const passwordValidateResult = validateByRules(password, rules.createPasswordRules(pwdType, false));
  if (!passwordValidateResult.success) throw new ValidationError(passwordValidateResult, "password");
  const passwordLengthValidateResult = validateByRules(password, rules.createLengthBetweenRule(pwdMinLength, pwdMaxLength));
  if (!passwordLengthValidateResult.success) throw new ValidationObjectError("userPasswordBetween", { min: pwdMinLength, max: pwdMaxLength });
  userValidator.validateName(name)
  userValidator.validatePhone(phone)
  userValidator.validateLineId(lineId)
  userValidator.validateOthers(others)
  //Account***
  const findAccount = await User.findOne({ account: account });
  if (findAccount) {
    throw new ValidationObjectError('accountOccupied', { accountUnavailable: account });
  }
  //Nickname**
  const findNickName = await User.findOne({ nickname: nickname });
  if (findNickName) {
    throw new ValidationObjectError('nicknameOccupied', { nicknameUnavailable: nickname });
  }
  next()
  // //role***
  // const roleCreationValidate = await validateRoleCreation(req);
  // if (!roleCreationValidate.success) throw new ValidationError(roleCreationValidate)
};
export const validateUserUpdateInfo = async (req, res, next) => {
  const { info } = req.body
  const { name, phone, lineId, others } = (info || {})
  const mustInputFields = { name, phone };
  validAllFieldsPresent(mustInputFields)

  userValidator.validateName(name)
  userValidator.validatePhone(phone)
  userValidator.validateLineId(lineId)
  userValidator.validateOthers(others)
  next()
};


function validAllFieldsPresent(fields) {
  for (const key in fields) {
    // 因為有些選項是 false 依樣是有填
    if (fields[key] === null || fields[key] === undefined) {
      throw new ValidationObjectError(`${key}Invalid`);
    }
  }
}
