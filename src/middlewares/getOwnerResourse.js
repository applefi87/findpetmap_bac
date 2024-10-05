import mongoose from 'mongoose'
import Article from '../models/articleModel.js';
// import Comment from '../models/commentModel.js';
// import Reply from '../models/replyModel.js';
// import BoardCreateRequest from '../models/boardCreateRequest.js';
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js'
import UnknownError from '../infrastructure/errors/UnknownError.js'

//Enter here must have req.user._id
export default (resourceType, selectString = null) => {
  return async (req, res, next) => {
    console.log("getResourseAndIsOwner");
    if (!req.user._id) throw new UnknownError(null, "middlewares getResourseAndIsOwner no req.user._id")
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ValidationObjectError("noFound")
    let resourceModel
    const finalSelectSrting = selectString ? (selectString + " user") : undefined
    console.log("resourceType", resourceType);
    switch (resourceType) {
      case "Article":
        resourceModel = Article
        break;
      //   case "Comment":
      //     resourceModel = Comment
      //     break;
      //   case "Reply":
      //     resourceModel = Reply
      //     // case "BoardCreateReq":
      //     //   resourceModel = BoardCreateRequest
      //     break;
      //   default:
      //     throw new UnknownError(null, "middlewares getResourseAndIsOwner no unknown resourceType")
    }
    const resource = await resourceModel
      .findById(req.params.id)
      .select(finalSelectSrting)
      .where('user')
      .equals(req.user._id.toString())
      .where('isDelete')
      .equals(false);
    console.log("resource", resource);
    if (!resource) throw new ValidationObjectError("noFound")
    req.resource = resource
    next()
  }
}

// export const getCreateBoardReqAndIsOwner = (selectString) => {
//   return async (req, res, next) => {
//     const id = req.params.id
//     let resource = await BoardCreateRequest.findById(id, selectString)
//     if (!resource) return next(new AuthorizationError("noFound"))
//     if (req.user?.id.toString() !== resource.user.toString()) {
//       return next(new AuthorizationError("notOwner"))
//     }
//     req.resource = resource
//     next()
//   };
// }