import { Router } from 'express';
import content from '../middlewares/content.js'
import * as auth from '../middlewares/auth.js'
import { validateCreateArticle, } from '../middlewares/validator/resourceValidator.js'
import getOwnerResourse from '../middlewares/getOwnerResourse.js'
// import admin from '../middlewares/admin.js'
import { createArticle } from '../controllers/articleController.js';

const router = Router();

// router.post('/', content('application/json'), auth.onlyGetIdFromJWT, validateGetArticleListWithBoard, getArticleListWithBoard);
router.post('/create', content('application/json'), auth.jwt("_id"), validateCreateArticle, createArticle);

// router.post('/update/:id', content('application/json'), auth.jwt("_id"), validateUpdateArticle, getOwnerResourse("Article", "title content"), updateArticle);
// router.delete('/:id', auth.jwt("_id"), getOwnerResourse("Article", "isDelete board"), deleteArticle);
// 在某版瀏覽文章清單時，直接點擊而浮的視窗會用到這(類似dcard)，只要基本的板名+其他文章詳細內容(可能預展開幾個留言+優先抓自己流過的(類似fb 最相關))
// router.get('/:id', content('application/json'), auth.onlyGetIdFromJWT, validateGetArticleDetail, getArticleDetail);

// router.post('/review/:id', content('application/json'), auth.jwt("_id securityData.role record.createBoardNum"), admin, validateReviewArticle, reviewArticle);
export default router;