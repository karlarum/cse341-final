const { MongoClient } = require("mongodb");

// Load environment variables from a .env file
require("dotenv").config();

const uri = process.env.MONGODB_URI;

let db;

const connectDb = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("task_manager");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDb first.");
  }
  return db;
};

module.exports = { connectDb, getDb };
