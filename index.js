import './src/preload.js'
import mongoose from 'mongoose';
import http from 'http';
import https from 'https';
import fs from 'fs';
import createApp from './src/createApp.js';
import ResponseHandler from './src/middlewares/ResponseHandler.js';
import PageNotFoundError from './src/infrastructure/errors/PageNotFoundError.js';
import Image from './src/models/imageModel.js';
// import "./test.js"

const app = createApp();
app.all('(.*)', (req, res) => { throw new PageNotFoundError(req.url) });
// Error handling middleware should be the last middleware added
app.use(ResponseHandler.errorHandler);

const port = process.env.PORT || 4000;
let server
if (process.env.NODE_ENV === 'development') {
  // 放這避免正式機跑到卻沒檔案
  server = https.createServer({
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
  }, app).listen(port, () => {
    console.log('HTTPS Server running on port ' + port);
  });
} else if (process.env.NODE_ENV === 'production') {
  server = http.createServer(app).listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default server;

// Haversine formula to calculate distance
function getRandomCoordinates(center, minRadiusInMeters = 1, maxRadiusInMeters = 20000) {
  const { latitude, longitude } = center;

  // Convert radius from meters to degrees
  const minRadiusInDegrees = minRadiusInMeters / 111320; // Conversion based on Earth's radius in meters
  const maxRadiusInDegrees = maxRadiusInMeters / 111320; // Conversion based on Earth's radius in meters

  // Generate random radius within the specified range
  const randomRadius = minRadiusInDegrees + (Math.random() * (maxRadiusInDegrees - minRadiusInDegrees));

  // Generate random point within the circle of the specified radius
  const t = 2 * Math.PI * Math.random();
  const deltaLat = randomRadius * Math.cos(t);
  const deltaLng = randomRadius * Math.sin(t) / Math.cos(latitude * Math.PI / 180);

  const newLat = latitude + deltaLat;
  const newLng = longitude + deltaLng;

  return [newLng, newLat]; // Returns [longitude, latitude] as required by GeoJSON
}

// Center location
const center = {
  latitude: 25.07148931,
  longitude: 121.5850925
};

const radiusInKm = 50; // 50 km radius
// Generate 100 random locations
const generateRandomLocations = () => {
  return Array.from({ length: 100 }, () => {
    return {
      location: {
        type: 'Point',
        coordinates: getRandomCoordinates(center)
      },
      // You can add other fields to each generated document here
      user: new mongoose.Types.ObjectId(), // Dummy ObjectId
      petType: '狗', // Example petType
      color: '黑', // Example color
      hasReward: Math.random() > 0.5, // Random boolean
      rewardAmount: Math.floor(Math.random() * 1000), // Random reward
      hasMicrochip: Math.random() > 0.5, // Random boolean
      lostDate: new Date(),
      lostCityCode: 'A', // Example city code
      lostDistrict: '大安區', // Example district
      content: 'Sample content for lost pet', // Example content
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

// To insert these random locations into your MongoDB using Mongoose:
// const newArr = generateRandomLocations()
// console.log(newArr);
// Article.insertMany(generateRandomLocations())
//   .then(() => {
//     console.log('Random articles inserted successfully');
//   })
//   .catch((err) => {
//     console.error('Error inserting articles:', err);
//   });
// update all image  isDelte = false
// await Image.updateMany({},{ $set: { isDelete: false } })
//

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