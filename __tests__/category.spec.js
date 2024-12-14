const { getDb } = require("../database/connect");
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
    jest.clearAllMocks(); // Clear mock data after each test
  });

  test("Should return 200 and categories list when fetch is successful", async () => {
    const { getCategories } = require("../controllers/categoryController");

    const mockCategories = [
      { _id: "1", name: "Category 1" },
      { _id: "2", name: "Category 2" },
    ];

    // Mock the database response
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(mockCategories.length),
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockCategories),
        }),
      }),
    });

    const req = {}; // No params needed for fetching categories
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCategories(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Check for 200 response
    expect(res.json).toHaveBeenCalledWith(mockCategories); // Ensure the correct data is returned
  });

  test("Should return 500 if getCategories fails", async () => {
    const { getCategories } = require("../controllers/categoryController");

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

  test("Should return 400 if ID is invalid in getCategoryById", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

    const req = { params: { id: "invalid-id" } }; // Invalid category ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(400); // Check for 400 response
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid ID" });
  });

  test("Should return 500 if getCategoryById fails", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

    const req = { params: { id: "64b2fc2a4f0c9c1d2f8c8a4b" } };
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
  test("Should return 404 if category not found", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

    // Mock Express req and res objects
    const req = { params: { id: "64b2fc2a4f0c9c1d2f8c8a4b" } }; // Provide a non-existent category ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the database to return null (no category found)
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null), // Simulate that no category was found
      }),
    });

    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(404); // Check for 404 response
    expect(res.json).toHaveBeenCalledWith({ error: "Category not found" }); // Ensure the correct error message
  });

  test("Should return 200 and the category if found", async () => {
    const { getCategoryById } = require("../controllers/categoryController");

    const req = { params: { id: "64b2fc2a4f0c9c1d2f8c8a4b" } }; // Provide an existing category ID
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockCategory = {
      _id: "64b2fc2a4f0c9c1d2f8c8a4b",
      name: "Test Category",
    };

    // Mock the database to return a category
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockCategory), // Simulate that a category is found
      }),
    });

    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(200); // Check for 200 response
    expect(res.json).toHaveBeenCalledWith(mockCategory); // Ensure the correct category is returned
  });
  test("Should return 201 and category ID if category is created successfully", async () => {
    const { createCategory } = require("../controllers/categoryController");

    const req = {
      body: {
        name: "Test Category",
        description: "This is a test category",
        parent_id: null,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockResponse = {
      acknowledged: true,
      insertedId: "64b2fc2a4f0c9c1d2f8c8a4b",
    };

    // Mock the database response to simulate a successful insert
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue(mockResponse),
      }),
    });

    await createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201); // Check for 201 response
    expect(res.json).toHaveBeenCalledWith({
      CategoryId: mockResponse.insertedId,
    }); // Ensure the correct CategoryId is returned
  });
  test("Should return 500 if category creation fails", async () => {
    const { createCategory } = require("../controllers/categoryController");

    const req = {
      body: {
        name: "Test Category",
        description: "This is a test category",
        parent_id: null,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockResponse = {
      acknowledged: false,
      insertedId: null,
    };

    // Mock the database response to simulate a failure in insertion
    getDb.mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue(mockResponse),
      }),
    });

    await createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500); // Check for 500 response
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create the Category.",
    }); // Ensure the correct error message is returned
  });
});
