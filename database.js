const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try Atlas connection first
    const atlasUri = process.env.MONGODB_URI;
    const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/path2wellness';
    
    let connectionUri = atlasUri;
    let connectionType = 'Atlas';
    
    // If Atlas URI is not properly configured, fall back to local
    if (!atlasUri || atlasUri.includes('<username>') || atlasUri.includes('<password>')) {
      console.log('⚠️  MongoDB Atlas URI not configured, using local MongoDB');
      connectionUri = localUri;
      connectionType = 'Local';
    }

    console.log(`🔌 Connecting to MongoDB ${connectionType}...`);
    
    const conn = await mongoose.connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ Connected to MongoDB ${connectionType}: ${conn.connection.host}`);
    console.log(`📊 Database: pathAIDB`);
    
    // Initialize database if needed
    try {
      const initDatabase = require('../scripts/initDatabase');
      await initDatabase();
    } catch (error) {
      console.log('ℹ️  Database already initialized or initialization skipped');
    }

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If Atlas fails, try local as fallback
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost')) {
      console.log('🔄 Attempting fallback to local MongoDB...');
      try {
        const localConn = await mongoose.connect(
          process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/path2wellness',
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        );
        console.log('✅ Connected to local MongoDB as fallback');
        return localConn;
      } catch (localError) {
        console.error('❌ Local MongoDB fallback also failed:', localError.message);
      }
    }
    
    console.log('⚠️  Server will continue running without database connection');
    console.log('📝 Some features may not work properly');
    throw error;
  }
};

// Handle MongoDB connection events
const setupConnectionEvents = () => {
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
};

module.exports = { connectDB, setupConnectionEvents };
