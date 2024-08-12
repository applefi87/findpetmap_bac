import User from '../models/userModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

const getUser = async (findBy, selectString = undefined, option = {}, isLean = false) => {
  try {
    return await User.findOne(findBy, selectString, option).lean(isLean)
  } catch (error) {
    throw new DatabaseError(error, findBy)
  }
}

const createUser = async (userObj, option) => {
  try {
    return await User.create(userObj, option)
  } catch (error) {
    throw new DatabaseError(error, userObj)
  }
}

const findOneUser = async (userObj, option) => {
  try {
    return await User.findOne(userObj, option)
  } catch (error) {
    throw new DatabaseError(error, userObj)
  }
}

const findUserById = async (id, selectString = undefined, option = {}, isLean = false) => {
  try {
    return await getUser({ _id: id }, selectString, option, isLean)
  } catch (error) {
    throw new DatabaseError(error, id)
  }
}

const updateUserById = async (id, update, option) => {
  try {
    return await User.findByIdAndUpdate(id, update, option)
  } catch (error) {
    throw new DatabaseError(error, { id, update })
  }
}

export default { getUser, createUser, findOneUser, findUserById, updateUserById }