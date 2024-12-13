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
// ***testing only itemController tests: 
// const itemRoutes = require("../routes/itemRoutes");

// Create instance of express
const app = express();
// Parse JSON through req.body
app.use(express.json());
// Use routes module for requests to root "/"
app.use("/", routes);
// ***testing only itemController tests:
// app.use("/item", itemRoutes);

describe("Test controllers for 500 response", () => {
  beforeEach(() => {
    // Mock causes mongodb.getDb to throw an error
    jest.mock("../database/connect", () => ({
      getDb: jest.fn(() => {
        throw new Error("Failed to connect to MongoDB.");
      }),
    }));
  });
  
  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    jest.unmock("../database/connect");
    // Reset mocks
    jest.resetModules();
  });

  test("Should return 500 if getItem fails", async () => {
    const { getItem } = require("../controllers/itemController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getItem(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Database not initialized. Call connectDb first.",
    });
  });

  test("Should return 500 if getItemById fails", async () => {
    const { getItemById  } = require("../controllers/itemController");

    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "64b2fc2a4f0c9c1d2f8c8a4b", 
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getItemById(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if createItem fails", async () => {
    const { createItem } = require("../controllers/itemController");

    // Mock Express req and res objects
    const req = { 
      body: {
        name: "Test Item",
        userId: "user123",
        categoryId: "cat456",
        coverageId: "cov789",
        purchaseDate: "2024-01-01",
        purchasePrice: 99.99,
        description: "Test item description"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await createItem(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({ 
      "error": "An error occurred: Failed to connect to MongoDB."
    });
  });

  test("Should return 500 if updateItem fails", async () => {
    const { updateItem  } = require("../controllers/itemController");

    // Mock Express req and res objects
    const req = { params: { 
      id: "64b2fc2a4f0c9c1d2f8c8a4b" 
      }, 
      body: {
        name: "Updated Test Item",
        userId: "user123",
        categoryId: "cat456",
        coverageId: "cov789",
        purchaseDate: "2024-01-01",
        purchasePrice: 149.99,
        description: "Updated test item description"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await updateItem (req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({ 
      "error": "An error occurred: Failed to connect to MongoDB."
    });
  });

  test("Should return 500 if deleteItem fails", async () => {
    const { deleteItem } = require("../controllers/itemController");

    // Mock Express req and res objects
    const req = { params: { id: "64b2fc2a4f0c9c1d2f8c8a4b" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await deleteItem(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({ 
      "error": "An error occurred: Failed to connect to MongoDB."
    });
  });
});

describe("Tests updateItem controller for valid record not in database", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 })
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

  test("Should return 404 if record does not exist when updating item", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b", 
      }, 
      body: {
        name: "Test Item",
        userId: null,
        categoryId: null,
        coverageId: null,
        purchaseDate: new Date(),
        purchasePrice: 99.99,
        description: "This is a test item"
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { updateItem } = require("../controllers/itemController");

    // Call the function with the mocked req/res values
    await updateItem(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Item not found.",
    });
  });
});

describe("Tests deleteItem controller for valid record not in database", () => {
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

  test("Should return 404 if record does not exist when deleting item", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "64b2fc2a4f0c9c1d2f8c8a4b", 
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteItem } = require("../controllers/itemController");

    // Call the function with the mocked req/res values
    await deleteItem(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No item found with that ID.",
    });
  });
});