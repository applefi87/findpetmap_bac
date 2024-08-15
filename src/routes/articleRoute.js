import { Router } from 'express';
import content from '../middlewares/content.js'
import * as auth from '../middlewares/auth.js'
import { validateCreateArticle,validateGetArticleDetail,validateSearchArticleList } from '../middlewares/validator/resourceValidator.js'
import getOwnerResourse from '../middlewares/getOwnerResourse.js'
// import admin from '../middlewares/admin.js'
import { createArticle, updateArticle, deleteArticle, getArticleDetail,searchArticleList } from '../controllers/articleController.js';

const router = Router();

router.post('/create', content('application/json'), auth.jwt("_id"), validateCreateArticle, createArticle);
router.put('/update/:id', content('application/json'), auth.jwt("_id"), validateCreateArticle, getOwnerResourse("Article"), updateArticle);
router.delete('/:id', auth.jwt("_id"), getOwnerResourse("Article", "isDelete"), deleteArticle);
// 在瀏覽文章清單時，直接點擊而浮的視窗會用到這(類似dcard)
router.get('/:id', auth.onlyGetIdFromJWT, validateGetArticleDetail, getArticleDetail);
router.post('/', content('application/json'), validateSearchArticleList, searchArticleList);

// router.post('/review/:id', content('application/json'), auth.jwt("_id securityData.role record.createBoardNum"), admin, validateReviewArticle, reviewArticle);
export default router;