const { connectDb, getDb } = require("../database/connect");
const request = require("supertest");
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const routes = require("../routes/index");

const app = express();
app.use(express.json());
app.use("/", routes);

// Mock the database functions outside the tests to avoid re-mocking
jest.mock("../database/connect", () => ({
  getDb: jest.fn(),
}));

describe("Test controllers for 500 response", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 200 and categories list when fetch is successful", async () => {
    const { getCategories } = require("../controllers/categoryController");

    // Mock the database response
    const mockCategories = [
      { _id: "1", name: "Category 1" },
      { _id: "2", name: "Category 2" },
    ];

    // Mock the getDb function to return a mocked database connection
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(mockCategories.length), // Mock countDocuments
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockCategories), // Mock toArray to return categories
        }),
      }),
    });

    // Mock Express req and res objects
    const req = {}; // No params needed for fetching categories
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the getCategories function with the mocked req/res values
    await getCategories(req, res);

    // Assertions to check if the correct status and data were returned
    expect(res.status).toHaveBeenCalledWith(200); // Check for 200 response
    expect(res.json).toHaveBeenCalledWith(mockCategories); // Ensure the correct data is returned
  });

  test("Should return 500 if getCategories fails", async () => {
    const { getCategories } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulate db failure
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest
          .fn()
          .mockRejectedValue(new Error("Failed to connect to MongoDB.")),
      }),
    });

    await getCategories(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch Categories",
    });
  });

  test("Should return 500 if getCategoryById fails", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

    const req = {
      params: { id: "64b2fc2a4f0c9c1d2f8c8a4b" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulate db failure
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest
          .fn()
          .mockRejectedValue(new Error("Failed to connect to MongoDB.")),
      }),
    });

    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch Category",
    });
  });

  const { getCategoryById } = require("../controllers/categoryController");
  const { getDb } = require("../database/connect");

  jest.mock("../database/connect", () => ({
    getDb: jest.fn(),
  }));

  describe("getCategoryById controller", () => {
    afterEach(() => {
      jest.clearAllMocks(); // Clear mock data after each test
    });

    test("Should return 400 if ID is invalid", async () => {
      // Mock Express req and res objects
      const req = { params: { id: "invalid-id" } }; // Provide an invalid category ID (non-ObjectId)
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the getCategoryById function with the mocked req/res values
      await getCategoryById(req, res);

      // Assertions to check if the correct status and message were returned
      expect(res.status).toHaveBeenCalledWith(400); // Check for 400 response
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid ID" }); // Ensure the correct error message is returned
    });
  });

  test("Should return 500 if createCategory fails", async () => {
    const { createCategory } = require("../controllers/categoryController");

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

    // Simulate db failure
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest
          .fn()
          .mockRejectedValue(new Error("Failed to connect to MongoDB.")),
      }),
    });

    await createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if updateCategory fails", async () => {
    const { updateCategory } = require("../controllers/categoryController");

    const req = {
      params: { id: "6759d95c78b34f58d00456ba" },
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

    // Simulate db failure
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        updateOne: jest
          .fn()
          .mockRejectedValue(new Error("Failed to connect to MongoDB.")),
      }),
    });

    await updateCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if deleteCategory fails", async () => {
    const { deleteCategory } = require("../controllers/categoryController");

    const req = { params: { id: "6759d95c78b34f58d00456ba" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Simulate db failure
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        deleteOne: jest
          .fn()
          .mockRejectedValue(new Error("Failed to connect to MongoDB.")),
      }),
    });

    await deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 200 and success message if category is deleted successfully", async () => {
    const { deleteCategory } = require("../controllers/categoryController");

    const req = { params: { id: "6759d95c78b34f58d00456ba" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDeleteResponse = { deletedCount: 1 };

    // Mock successful db response
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        deleteOne: jest.fn().mockResolvedValue(mockDeleteResponse),
      }),
    });

    await deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Category deleted successfully.",
    });
  });

  test("Should return 404 if category not found for deletion", async () => {
    const { deleteCategory } = require("../controllers/categoryController");

    const req = { params: { id: "6759f2d2b7aaf3eb2152c14b" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockDeleteResponse = { deletedCount: 0 };

    // Mock failed db response (category not found)
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        deleteOne: jest.fn().mockResolvedValue(mockDeleteResponse),
      }),
    });

    await deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No Category found with that ID.",
    });
  });
});
