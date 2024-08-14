// import { trusted } from 'mongoose'
// import imageRepository from '../repositories/imageRepository.js'
// import draftService from '../services/draftService.js'
// import articleImageListService from '../services/articleImageListService.js'

// async function createImageSession(imageObj, session) {
//   return await imageRepository.createImage([imageObj], { session })
// }

// async function setImagesIsDeleteSession(imageOidArray, session) {
//   return await imageRepository.updateImagesByOids(imageOidArray, { $set: { isDelete: true } }, { session })
// }

// async function addResourceUsageCountFromOids(imageOidArray, session) {
//   if (!imageOidArray || imageOidArray.length < 1) { return }
//   // const result = await imageRepository.updateImagesByOids(
//   //   imageOidArray,
//   //   { $pull: { resourceList: { resource: resourceOid, resourceType } } },
//   //   { session }
//   // );
//   return await imageRepository.updateImagesByOids(
//     imageOidArray,
//     [
//       {
//         $set: {
//           resourceUsageCount: { $add: ["$resourceUsageCount", 1] },
//           isDelete: {
//             $cond: {
//               // 因為當下原本是0 被+1 變成1 所以原本小於0 才可能繼續保持負數
//               if: { $lt: ["$resourceUsageCount", 0] },
//               then: true,
//               else: false
//             }
//           }
//         }
//       }
//     ],
//     { session }
//   );
// }

// async function removeResourceUsageCountFromImageList(imageOidArray, session) {
//   if (!imageOidArray || imageOidArray.length < 1) { return }
//   // const result = await imageRepository.updateImagesByOids(
//   //   imageOidArray,
//   //   { $pull: { resourceList: { resource: resourceOid, resourceType } } },
//   //   { session }
//   // );
//   return await imageRepository.updateImagesByOids(
//     imageOidArray,
//     [
//       {
//         $set: {
//           resourceUsageCount: { $add: ["$resourceUsageCount", -1] },
//           isDelete: {
//             $cond: {
//               // 因為當下原本是1 被-1 變成0 所以原本小於2就可以
//               if: { $lt: ["$resourceUsageCount", 2] },
//               then: true,
//               else: false
//             }
//           }
//         }
//       }
//     ],
//     { session }
//   );
// }

// async function findImagesByFullPaths(fullPaths, selectionString, isLean = false) {
//   return await imageRepository.findImages({ fullPath: trusted({ $in: fullPaths }) }, selectionString, isLean);
// }

// async function getFinalImageListAndUpdateImage(imageList, recordedUsedImageList, session) {
//   const includeImageList = [];
//   const notIncludeImageIdList = [];
//   const newImageList = [];

//   // Populate includeImageList and notIncludeImageIdList
//   for (const item of recordedUsedImageList) {
//     if (imageList.includes(item.fullPath)) {
//       includeImageList.push(item);
//     } else {
//       notIncludeImageIdList.push(item.id);
//     }
//   }

//   // Populate newImageList with images in imageList but not in recorderUsedImageList
//   for (const imageFullPath of imageList) {
//     if (!recordedUsedImageList.some(item => item.fullPath === imageFullPath)) {
//       newImageList.push(imageFullPath);
//     }
//   }
//   await removeResourceUsageCountFromImageList(notIncludeImageIdList, session)
//   //取得符合條件的imageList 清單 並放到draft去
//   const newImageArray = await findImagesByFullPaths(newImageList, "id fullPath", true)
//   const newImageOidArray = [];
//   const newImageArrayWithId = [];

//   newImageArray.forEach(image => {
//     newImageOidArray.push(image._id);
//     newImageArrayWithId.push({ id: image._id, fullPath: image.fullPath });
//   });
//   await addResourceUsageCountFromOids(newImageOidArray, session)
//   const finalImageList = includeImageList;
//   finalImageList.push(...newImageArrayWithId)
//   return finalImageList
// }



// export default {
//   createImageSession, setImagesIsDeleteSession, addResourceUsageCountFromOids, removeResourceUsageCountFromImageList, findImagesByFullPaths,
//   getFinalImageListAndUpdateImage
// }