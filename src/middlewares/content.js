import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'
export default (type) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType?.startsWith(type)) {
      throw new ValidateObjectError("validation.invalidType")
    }
    //'multipart/form-data' 複雜/檔案
    //'application/json' 一般api
    next()
  }
}
