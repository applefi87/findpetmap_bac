import './src/preload.js'
import http from 'http';
import createApp from './src/createApp.js';
import ResponseHandler from './src/middlewares/ResponseHandler.js';
import PageNotFoundError from './src/infrastructure/errors/PageNotFoundError.js';
// import "./test.js"

const app = createApp();
app.all('(.*)', (req, res) => { throw new PageNotFoundError(req.url) });
// Error handling middleware should be the last middleware added
app.use(ResponseHandler.errorHandler);

const port = process.env.PORT || 4000;

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
export default server;

// //**** */
// const io = new Server(server, { cors: corsOption });
// // io.on('connection', (socket) => {
// //   console.log("io.connect");
// // });


// export default io;

// //建徽章
// await Badge.create({
//   name: {
//     "en-US": "Board Creator",
//     "zh-TW": "創版者"
//   }, code: "BoardCreator"
// })

// //幫用戶加徽章
// // await UserBadge.create({user:"64391f87a83a413a915d6f93"})


// // await Comment.updateMany({}, { $set: { isFeedback: false } });

// // Board.updateMany(
// //   {},
// //   [
// //     {
// //       $set: {
// //         isApproved: false
// //       }
// //     },
// //     {
// //       $unset: 'status'
// //     }
// //   ]
// // )