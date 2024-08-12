import 'dotenv/config';
import mongoose from 'mongoose';

// Function to initialize and connect to MongoDB
export const connectToRealDBReadonly = async () => {
  try {
    mongoose.set('strictQuery', true);
    mongoose.set('sanitizeFilter', true);
    await mongoose.connect(process.env.mongoDB_atlas_URL_readonly, {
      autoIndex: true
    });
    // console.log('Connected to real MongoDB with read-only access');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

// Immediately connect when the module is first imported
(async () => {
  await connectToRealDBReadonly();
})();