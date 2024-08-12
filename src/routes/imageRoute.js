import express from 'express';
import multer from 'multer';
import content from '../middlewares/content.js'
import * as auth from '../middlewares/auth.js'
import handleSingleImageUpload from '../middlewares/handleSingleImageUpload.js'
import getOwnerResourse from '../middlewares/getOwnerResourse.js'
import { saveImageIntoSomeDraft, refreshDraftImageList } from '../controllers/imageController.js';
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload/draft', content('multipart/form-data'), auth.jwt(), handleSingleImageUpload, saveImageIntoSomeDraft("Draft"));
router.post('/upload/articleUpdateDraft/:id', content('multipart/form-data'), auth.jwt(), getOwnerResourse("Article", "_id"), handleSingleImageUpload, saveImageIntoSomeDraft("ArticleUpdateDraft"));
router.post('/refreshImageList/draft', content('application/json'), auth.jwt("_id"), refreshDraftImageList("Draft"))
router.post('/refreshImageList/articleUpdateDraft/:id', content('application/json'), auth.jwt("_id"), getOwnerResourse("Article", "_id"), refreshDraftImageList("ArticleUpdateDraft"))
// router.post('/add/tempImageList', content('multipart/form-data'), auth.jwt(), handleSingleImageUpload, uploadImage, saveImageUrlIntoTempImageList);
// router.post('/add/profileImage', content('multipart/form-data'), auth.jwt("profileImage"), handleSingleImageUpload, uploadImage, saveImageUrlIntoUser);

export default router;