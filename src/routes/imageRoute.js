import express from 'express';
import content from '../middlewares/content.js'
import * as auth from '../middlewares/auth.js'
import handleSingleImageUpload from '../middlewares/handleSingleImageUpload.js'
import { validateArticleImageCountAndNoIsPreview } from '../middlewares/validator/imageValidator.js'
import getOwnerResourse from '../middlewares/getOwnerResourse.js'
import { saveImage } from '../controllers/imageController.js';
const router = express.Router();

// 實際圖片流程:
// 發文
// 1. 發文時前端用戶最多3張圖+最多一張選當預覽圖
// 2. 發布後，先建立文章，回傳200+文章id後,以此id一個個打傳圖api
// 2-1. api必包含(文章id),圖片檔(前端應該抓先傳用戶選isPreview的,所以後端預設把第一章當預覽，解決如果傳到一半失敗，文章沒有預覽圖)
// 2-2. 後端收到後，檢查是文章本人+該文章已有圖片沒有到3個>>>新圖isPreview若為true，則舊圖不可true，改為false (若沒有圖，則改為true)
// 2-3. 文章創建是替一張圖片: 增加低畫質圖片到預覽table >>> 其他繼續 
// 3. 回傳200 前端全上傳完，改導覽到文章詳細頁

//--
// 編輯文章:(基本規則同發文)
// (複雜情境: 保留原本2張圖，一張改新的當預覽)
// 0.取文章時圖片清單會有id
// 1.儲存時，多個欄位指示要保留的image id,不然其他的圖片改成isDelete=true(等於舊圖當不要,至於預覽圖不動，這設計以免更新一半出異常，至舊圖全消失/預覽圖消失)，一樣先存文章內容，回傳200後一個個打傳圖api
// api post /image/upload/article : 上傳+如果有新的 isPreview 就重新產(直接把舊的改成isDelete=true)

// 4. 回傳200 前端全上傳完，改導覽到文章詳細頁
// 最慘是新圖

// in {isPreview } req.body, file*,id*
router.post('/upload/article/:id', content('multipart/form-data'), auth.jwt("_id"), getOwnerResourse("Article", "_id"), handleSingleImageUpload, validateArticleImageCountAndNoIsPreview, saveImage);

export default router;