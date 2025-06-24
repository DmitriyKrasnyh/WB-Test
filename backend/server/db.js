import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wb';

export const connectDB = async () => {
  await mongoose.connect(MONGO_URI, {
    dbName: 'wb',                     // база «wb»
  });
  console.log('✓ MongoDB connected');
};
