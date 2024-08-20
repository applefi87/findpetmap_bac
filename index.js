import './src/preload.js'
import mongoose from 'mongoose';
import http from 'http';
import createApp from './src/createApp.js';
import ResponseHandler from './src/middlewares/ResponseHandler.js';
import PageNotFoundError from './src/infrastructure/errors/PageNotFoundError.js';
import Article from './src/models/articleModel.js';
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

// Haversine formula to calculate distance
function getRandomCoordinates(center, minRadiusInKm=0.001, maxRadiusInKm=10) {
  const { latitude, longitude } = center;

  // Convert radius from kilometers to degrees
  const minRadiusInDegrees = minRadiusInKm / 111; // Rough conversion
  const maxRadiusInDegrees = maxRadiusInKm / 111; // Rough conversion

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
  latitude: 25.071489314010798,
  longitude: 121.58509254432573
};

const radiusInKm = 50; // 50 km radius
// Generate 100 random locations
const generateRandomLocations = ()=>{
  return Array.from({ length: 1000 }, () => {
    return {
      location: {
        type: 'Point',
        coordinates: getRandomCoordinates(center, radiusInKm)
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

// Article.insertMany(generateRandomLocations())
//   .then(() => {
//     console.log('Random articles inserted successfully');
//   })
//   .catch((err) => {
//     console.error('Error inserting articles:', err);
//   });

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