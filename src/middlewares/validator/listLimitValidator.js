import ValidationError from '../../infrastructure/errors/ValidationError.js'
import listLimitConfigs from '../../infrastructure/configs/listLimitConfigs.js';

export const validateAndFormatSkipLimit = (resourceType) => {
  return async (req, res, next) => {
    const lowerCaseResourceType = resourceType.toLowerCase()
    const { skip, limit } = req.body
    const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
    const theLimitConfig = listLimitConfigs[lowerCaseResourceType]
    const validatedLimit = limit <= theLimitConfig.limitMax && limit >= theLimitConfig.limitMin ? limit : theLimitConfig.limitMin
    req.skip = validatedSkip
    req.limit = validatedLimit
    next()
  }
}

// export const validateAddBoard = (resourceType) => {
//   return async (req, res, next) => {
//     const lowerCaseResourceType = resourceType.toLowerCase()
//     const { skip, limit } = req.body
//     const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
//     const theLimitConfig = listLimitConfigs[lowerCaseResourceType]
//     const validatedLimit = limit <= theLimitConfig.limitMax && limit >= theLimitConfig.limitMin ? limit : theLimitConfig.limitMin
//     req.skip = validatedSkip
//     req.limit = validatedLimit
//     next()
//   }
// }