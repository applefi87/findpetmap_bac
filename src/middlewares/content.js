export default (type) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType?.startsWith(type)) {
      return res.status(400).send({ success: false, message: '資料格式錯誤' })
    }
    //'multipart/form-data' 複雜/檔案
    //'application/json' 一般api
    next()
  }
}
