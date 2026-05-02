import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

  if (!uri) {
    throw new Error('MongoDB connection string is required. Set MONGODB_URI in your environment variables.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
