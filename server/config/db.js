const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/budgetbrain';

  // In production (Vercel), MONGO_URI must point to Atlas — no in-memory fallback
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is required in production. Set up MongoDB Atlas.');
      process.exit(1);
    }

    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`📦 MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      throw error;
    }
  }

  // Development: try configured URI first, then fall back to in-memory
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('🔄 Starting in-memory MongoDB server...');
  }

  // Fallback: use in-memory MongoDB (dev only)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    const conn = await mongoose.connect(memUri);
    isConnected = true;
    console.log(`📦 In-memory MongoDB started: ${conn.connection.host}`);
    console.log('⚠️  Data will be lost when the server stops. Use MongoDB Atlas for persistence.');

    // Cleanup on exit
    const cleanup = async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    };
    process.on('SIGINT', async () => { await cleanup(); process.exit(0); });
    process.on('SIGTERM', async () => { await cleanup(); process.exit(0); });
  } catch (error) {
    console.error(`❌ Failed to start in-memory MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
