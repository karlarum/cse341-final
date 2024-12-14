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

  test("Should return 500 if getCategories fails", async () => {
    const { getCategories } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getCategories(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch Categories",
    });
  });

  test("Should return 500 if getCategoryById fails", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

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
    await getCategoryById(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch Category",
    });
  });

  test("Should return 500 if createCategory fails", async () => {
    const { createCategory } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = {
      body: {
        name: "test name",
        description: "This is a jest unit test.",
        parent_id: null,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await createCategory(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if updateCategory fails", async () => {
    const { updateCategory } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = {
      params: {
        id: "6759d95c78b34f58d00456ba",
      },
      body: {
        name: "test name",
        description: "This is a jest unit test.",
        parent_id: null,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await updateCategory(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if deleteCategory fails", async () => {
    const { deleteCategory } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = { params: { id: "6759d95c78b34f58d00456ba" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await deleteCategory(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 200 and all categories when fetch is successful", async () => {
    // Mock the database response
    const mockCategories = [
      { _id: "1", name: "Category 1" },
      { _id: "2", name: "Category 2" },
    ];

    // Mocking the getDb method to return a mocked database connection
    jest.mock("../database/connect", () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          countDocuments: jest.fn().mockResolvedValue(mockCategories.length), // Mock countDocuments
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockCategories), // Mock toArray to return categories
          }),
        }),
      }),
    }));

    const { getCategories } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = {}; // No params needed for fetching categories
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getCategories(req, res);

    // Assertions to check if the correct status and data were returned
    expect(res.status).toHaveBeenCalledWith(200); // Check for 200 response
    expect(res.json);
  });
});
// describe("Tests updateCategory controller for valid record not in database", () => {
//   let connection;
//   let db;

//   beforeAll(async () => {
//     connection = await MongoClient.connect(global.__MONGO_URI__);
//     // Connect to team database explicitly
//     db = await connection.db("team");

//     jest.mock('../database/connect', () => ({
//       getDb: jest.fn().mockReturnValue({
//         collection: jest.fn().mockReturnValue({
//           replaceOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
//         })
//       })
//     }));
//   });

//   /* Closes db connection, frees up resources, prevents memory leaks. */
//   afterAll(async () => {
//     await connection.close();
//     jest.clearAllMocks(); // Clear any mock behavior
//   });

//   afterEach(() => {
//     // Restore mocks
//     jest.clearAllMocks();
//     // Remove mock so other tests are not affected
//     jest.unmock("../database/connect");
//     jest.resetModules();
//   });

//   test("Should return 404 if record does not exist when updating category", async () => {
//     // Mock Express req and res objects
//     const req = {
//       params: {
//         // Mock valid ObjectId
//         id: "6759f2d2b7aaf3eb2152c14b",
//       },
//       body: {
//         name: "test name",
//         description: "This is a jest unit test.",
//         parent_id: null
//       },
//     };

//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };

//     const { updateCategory } = require("../controllers/categoryController");

//     // Call the function with the mocked req/res values
//     await updateCategory(req, res);

//     // Verify that the invalid ID is handled correctly
//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.json).toHaveBeenCalledWith({
//       error: "No Category found with that ID.",
//     });
//   });
// });

describe("Tests deleteCategory controller for valid record not in database", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock("../database/connect", () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
        }),
      }),
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

  test("Should return 404 if record does not exist when deleting category", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b",
      },
      body: {
        name: "test name",
        userId: null,
        categoryId: null,
        coverageId: null,
        purchaseDate: new Date(),
        purchasePrice: 0,
        description: "This is a jest unit test.",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteCategory } = require("../controllers/categoryController");

    // Call the function with the mocked req/res values
    await deleteCategory(req, res);

    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No Category found with that ID.",
    });
  });
});
