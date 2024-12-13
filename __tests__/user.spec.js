// Import connectDb to initialize the database
const { connectDb, getDb } = require("../database/connect");

// Import Supertest HTTP library
const request = require("supertest");
// Import the express library
const express = require("express");

/* Import MongoClient class from mongodb library. Allows access to mongodb database. */
const { MongoClient, ObjectId } = require("mongodb");
// Import routes index where subroutes are defined
const routes = require("../routes/index");

// Create instance of express
const app = express();
// Parse JSON through req.body
app.use(express.json());
// Use routes module for requests to root "/"
app.use("/", routes);

describe("Tests deleteUser controller for valid record not in database", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
        })
      })
    }));
  });

  /* Closes db connection, frees up resources, prevents memory leaks. */
  afterAll(async () => {
    await connection.close();
    jest.clearAllMocks(); // Clear any mock behavior
  });

  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 401 if is unauthorized when deleting user", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock username parameter
        username: "userA", 
      }, 
      user: {
        // Mock user parameter
        username: "user", 
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteUser } = require("../controllers/userController");

    // Call the function with the mocked req/res values
    await deleteUser(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
    });
  });
});

describe("Tests deleteUser controller for valid record not in database", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          deleteOne: jest.fn(() => Promise.resolve({ deletedCount: 0 })),
        })
      })
    }));
  });

  /* Closes db connection, frees up resources, prevents memory leaks. */
  afterAll(async () => {
    await connection.close();
    jest.clearAllMocks(); // Clear any mock behavior
  });

  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 404 if record does not exist when deleting user", async () => {
    // Mock Express req and res objects
    const req = {
      params: { username: "user" },
      user: { username: "user" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteUser } = require("../controllers/userController");

    // Call the function
    await deleteUser(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found.",
    });
  });
});
