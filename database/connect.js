const { MongoClient } = require("mongodb");

// Load environment variables from a .env file
require("dotenv").config();

const uri = process.env.MONGODB_URI;

let db;

const connectDb = async (clientDb) => {
  if (!clientDb) {
    throw new Error("MongoClient instance is required");
  }
  try {
    const client = new MongoClient(uri);
    console.log("Creating MongoClient...");
    // client = new MongoClient(uri);
    console.log("Attempting to connect...");
    await client.connect();
    console.log("Connection successful!");
    db = client.db("team");
    console.log("Connected to MongoDB:", db.databaseName);
  } catch (error) {
    console.log("ERROR CATCH BLOCK EXECUTED");
    console.error("Failed to connect to MongoDB", error);
  }
};

// const connectDb = async () => {
//   try {
//     const client = new MongoClient(uri);
//     await client.connect();
//     db = client.db("team");
//     console.log("Connected to MongoDB");

//     // Test query
//     const testCollection = db.collection("category");
//     const data = await testCollection.find({}).toArray();
//     console.log("Sample data from 'test' collection:", data);
//   } catch (error) {
//     console.error("Failed to connect to MongoDB", error);
//   }
// };

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDb first.");
  }
  return db;
};

module.exports = { connectDb, getDb };
