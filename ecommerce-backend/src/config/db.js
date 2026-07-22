import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => logger.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('🔄 MongoDB reconnected'));
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
