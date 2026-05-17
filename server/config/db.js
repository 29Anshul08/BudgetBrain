const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/budgetbrain';

  // First try connecting to the configured URI (local/Atlas)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`⚠️  Could not connect to MongoDB at ${uri}`);
    console.log('🔄 Starting in-memory MongoDB server...');
  }

  // Fallback: use in-memory MongoDB
  try {
    mongoServer = await MongoMemoryServer.create();
    const memUri = mongoServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`📦 In-memory MongoDB started: ${conn.connection.host}`);
    console.log('⚠️  Data will be lost when the server stops. Use MongoDB Atlas for persistence.');
  } catch (error) {
    console.error(`❌ Failed to start in-memory MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Cleanup on exit
const cleanup = async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
};

process.on('SIGINT', async () => { await cleanup(); process.exit(0); });
process.on('SIGTERM', async () => { await cleanup(); process.exit(0); });

module.exports = connectDB;
