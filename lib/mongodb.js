import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

/** @type {import("mongodb").MongoClient} */
let client;
/** @type {Promise<import("mongodb").MongoClient>} */
let clientPromise;

try {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable to prevent multiple connections
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best not to use a global variable
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  throw error;
}

export default clientPromise;