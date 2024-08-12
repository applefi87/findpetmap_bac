import anValidator from 'an-validator';
import ValidationError from '../../infrastructure/errors/ValidationError.js';
import UnknownError from '../../infrastructure/errors/UnknownError.js';

const { rules, validateByRules } = anValidator;
// 信箱基本加工
export default function (email) {
  //近來都要是標準email格式
  const validateEmailResult = validateByRules(email, rules.createEmailRules(false))
  if (!validateEmailResult.success) throw new ValidationError(validateEmailResult);
  let idx = email.indexOf("@")
  let front = email.substr(0, idx)
  let back = email.substr(idx + 1, email.length)
  // 目前直接不允許有.再前面的 // 解決名稱的"."會被許多信箱忽略，而可重複註冊
  // front = front?.replace(/\./g, "")
  // 解決gmail內部通用名
  back = back?.replace("googlemail", 'gmail')
  return front + "@" + back
  // 不再有./gmail重複/大寫
}