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

// **** CONNECTION ERROR TESTS ****
// connection error test
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

// **** NOT FOUND TESTS  ****
// not found error - update item that doesn't exist
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
// not found error - delete item that doesn't exist
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
// not found error - get items from an empty database
describe("Test getItem when no items exist", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])  // empty array
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 404 when no items exist", async () => {
    const { getItem } = require("../controllers/itemController");
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No items found."
    });
  });
});

// **** SUCCESS TESTS ****
// successful retrieval of items from database
describe("Test getItem success scenarios", () => {
  beforeEach(() => {
    const mockObjectId = '64b2fc2a4f0c9c1d2f8c8a4b';
    const mockItems = [
      { 
        _id: mockObjectId,
        name: "Test Item",
        userId: "user123",
        categoryId: "cat456",
        purchasePrice: 99.99
      }
    ];

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockItems)
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should successfully return items when they exist", async () => {
    const { getItem } = require("../controllers/itemController");
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Test Item",
          userId: "user123"
        })
      ])
    );
  });
});
// updating item when no changes are needed
describe("Test updateItem scenarios", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should handle case where item exists but no changes needed", async () => {
    const { updateItem } = require("../controllers/itemController");
    
    // Mock updateOne to return matchedCount 1 but modifiedCount 0
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 0 })
        })
      })
    }));

    const req = {
      params: {
        id: "64b2fc2a4f0c9c1d2f8c8a4b"
      },
      body: {
        name: "Test Item",
        description: "Test Description"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "No changes made to the item."
    });
  });
});

// **** VALIDATION ERRORS ****
// Tests when an invalid ID format is provided for getting an item
describe("Test getItemById with invalid ObjectId", () => {
  test("Should return 500 when invalid ObjectId is provided", async () => {
    const { getItemById } = require("../controllers/itemController");
    const req = {
      params: {
        // Make ObjectId fail
        id: "invalid-id"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getItemById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error).toContain("An error occurred");
  });
});
// Tests when an invalid ID format is provided for updating an item
describe("Test updateItem with invalid ObjectId", () => {
  test("Should return 500 when invalid ObjectId is provided", async () => {
    const { updateItem } = require("../controllers/itemController");
    const req = {
      params: {
        id: "invalid-id"
      },
      body: {
        name: "Test Item"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error).toContain("An error occurred");
  });
});
// Tests when an invalid ID format is provided for deleting an item
describe("Test deleteItem with invalid ObjectId", () => {
  test("Should return 500 when invalid ObjectId is provided", async () => {
    const { deleteItem } = require("../controllers/itemController");
    const req = {
      params: {
        id: "invalid-id"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error).toContain("An error occurred");
  });
});

// **** DATABASE ERRORS ****
// Tests what happens when getting a single item fails
describe("Test getItemById error handling", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockImplementation(() => {
            throw new Error("Database error");
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should handle database error in getItemById", async () => {
    const { getItemById } = require("../controllers/itemController");
    const req = {
      params: {
        id: "64b2fc2a4f0c9c1d2f8c8a4b"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getItemById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Database not initialized. Call connectDb first."
    });
  });
});
// Tests what happens when creating an item fails
describe("Test createItem database error", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn().mockImplementation(() => {
            throw new Error("Insert failed");
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should handle database error during insert", async () => {
    const { createItem } = require("../controllers/itemController");
    const req = {
      body: {
        name: "Test Item"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Insert failed"
    });
  });
});
// Tests what happens when the database acknowledges but fails to insert a new item
describe("Test createItem with failed insert", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn().mockResolvedValue({ acknowledged: false })  // Simulate failed insert
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 500 when insert fails", async () => {
    const { createItem } = require("../controllers/itemController");
    const req = {
      body: {
        name: "Test Item"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to create the item."
    });
  });
});
// Tests what happens when updating an item fails
describe("Test updateItem database error", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockImplementation(() => {
            throw new Error("Update failed");
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should handle database error during update", async () => {
    const { updateItem } = require("../controllers/itemController");
    const req = {
      params: {
        id: "64b2fc2a4f0c9c1d2f8c8a4b"
      },
      body: {
        name: "Updated Item"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Update failed"
    });
  });
});
// Tests what happens when deleting an item fails
describe("Test deleteItem database error", () => {
  beforeEach(() => {
    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockImplementation(() => {
            throw new Error("Delete failed");
          })
        })
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should handle database error during delete", async () => {
    const { deleteItem } = require("../controllers/itemController");
    const req = {
      params: {
        id: "64b2fc2a4f0c9c1d2f8c8a4b"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteItem(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Delete failed"
    });
  });
});