// preloadMemoryDB.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Settings for Mongoose
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

let mongoServer;
export const connectToMemoryDB = async () => {
  console.log("preload connectToMemoryDB");
  try {
    let mongoServer = await MongoMemoryReplSet.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { autoIndex: true });
  } catch (err) {
    console.error('Failed to initialize MongoMemoryServer or connect to it:', err);
    throw err;
  }
};

// Immediately invoke the function to connect
(async () => {
  await connectToMemoryDB();
})();