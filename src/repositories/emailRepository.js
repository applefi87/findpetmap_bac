import Email from '../models/emailModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

const getEmail = async (findBy, selectString = undefined) => {
  try {
    return await Email.findOne(findBy).select(selectString)
  } catch (error) {
    throw new DatabaseError(error, findBy)
  }
}
const createEmail = async (emailObj) => {
  try {
    return await Email.create(emailObj)
  } catch (error) {
    throw new DatabaseError(error, emailObj)
  }
}


export default { getEmail, createEmail }