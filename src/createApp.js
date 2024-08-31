//設定error追蹤的深度倒數層數
Error.stackTraceLimit = 15
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';
import emailRouter from "./routes/emailRoute.js"
import userRouter from "./routes/userRoute.js"
import articleRouter from "./routes/articleRoute.js"
import imageRouter from "./routes/imageRoute.js"
import ResponseHandler from './middlewares/ResponseHandler.js';
import createI18nMiddleware from './middlewares/createI18nMiddleware.js';
import './passport/passport.js'
import DatabaseError from "./infrastructure/errors/DatabaseError.js"

const createApp = () => {
  const app = express();

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 150, // Limit each IP to 150 requests per 2 minutes
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);
  app.set('trust proxy', 1);  // Middleware
  app.use(cookieParser());
  const i18nMiddleware = createI18nMiddleware();
  app.use(i18nMiddleware);

  const corsOption = {
    origin: (origin, callback) => {
      const corsCheck = process.env.NODE_ENV === 'main'
        ? origin && (origin.startsWith('https://www.knowforum.com') || origin.startsWith('https://knowforum.com'))
        : (origin === undefined || origin === 'https://tipspert.onrender.com' || origin === 'http://localhost:9100' || true);
      if (corsCheck) {
        callback(null, true);
      } else {
        console.log("CORS origin:", origin, ", corsCheck=", corsCheck);
        callback(new Error('Not Allowed'), false);
      }
    },
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    exposedHeaders: ["set-cookie"],
    // allowedHeaders: ['Content-Type', 'X-H', 'x-requested-with', 'Accept']
  };
  app.use(cors(corsOption));

  // Sanitize MongoDB queries
  // app.use(mongoSanitize({
  //   replaceWith: '_'
  // }));
  app.use(express.json({ limit: '5mb' }));
  app.get('/', async (req, res, next) => {
    return ResponseHandler.success(res);
  });

  //temp for develop test
  app.get('/test', async (req, res, next) => {
    // throw new Error("ERR")
    try {
      // const users = await Board.create({
      //   status: 2,
      //   description: 'new board3 desc...........',
      //   name: {
      //     "zh-TW":"華為 P40 Pro",
      //     "en-US":"HUAWEI P40 Pro"
      //   }
      // })
      // const board =  await Board.findById("6697549a88267da2bdaba2ee","_id")
      // console.log(board);
      // board.status++
      // await board.save()
      // const boardNew =  await Board.findById("6697549a88267da2bdaba2ee","status description")
      // console.log(boardNew);
      return ResponseHandler.success(res);
    } catch (error) {
      throw new DatabaseError(error)
    }
  });

  // Additional routes can be defined here
  // app.use('/admin', adminRouter);
  // app.use('/noti', notificationRouter);


  app.use('/user', userRouter);
  app.use('/email', emailRouter);
  app.use('/article', articleRouter);
  app.use('/image', imageRouter);

  return app;
};

export default createApp;
