import mongoose from 'mongoose';
const { ServerApiVersion } = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'Chatapp';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
const opts = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  bufferCommands: false
};
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function DbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      ...opts,
      dbName: DB_NAME  // Specify database name
    }).then(async (mongoose) => {
      // Ping test for Chatapp database
      try {
        await mongoose.connection.db.command({ ping: 1 , db: DB_NAME });
        console.log(`Successfully connected to ${DB_NAME} database!`);
      } catch (error) {
        console.error(`Failed to connect to ${DB_NAME} database:`, error);
        throw error;
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default DbConnect;