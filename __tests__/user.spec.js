// Import connectDb to initialize the database
const { connectDb, getDb } = require("../database/connect");

// Import jsonwebtoken module to work with JWTs
const jwt = require("jsonwebtoken");

// Mock jsonewebtoken to simulate token verification
jest.mock("jsonwebtoken");

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

// ########################
// Testing HTTP 401 Errors
// ########################
describe("Tests getUserByUsername controller for valid record not in database", () => {
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

  test("Should return 401 if is unauthorized when searching user", async () => {
    const { getUserByUsername  } = require("../controllers/userController");

    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        username: "user", 
      },
      user: {
        username: "mockUser"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getUserByUsername(req, res);

    // Verify that the invalid user is handled correctly
    expect(res.status).toHaveBeenCalledWith(401);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Requesting someone elses data",
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

// ########################
// Testing HTTP 404 Errors
// ########################
describe("Tests updateUser controller for valid record not in database", () => {
  let connection;
  let db;

  /* Set up connection to MongoDB. */
  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
        })
      })
    }));
  });

  /* Closes db connection, frees up resources, prevents memory leaks. */
  afterAll(async () => {
    await connection.close();
    jest.clearAllMocks(); 
  });

  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 404 if record does not exist when updating user", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b", 
      }, 
      body: {
        userName: "mockUser",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "testG@example.com",
        phone: "555-555-5555",
        address: "123 Mock Street",
        city: "Mock City",
        state: "AB", 
        zip: "55555", 
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { updateUser } = require("../controllers/userController");

    // Call the function with the mocked req/res values
    await updateUser(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found or no changes made.",
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

// ########################
// Testing HTTP 201, 409, 500 CreateUser Error
// ########################
describe("createUser", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn(),
    }));
  });

  beforeEach(() => {
    const mockInsertResponse = { acknowledged: true, insertedId: "mockedUserId" };
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(null), // No existing user
        insertOne: jest.fn().mockResolvedValue(mockInsertResponse), // Successful insert
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);
    // Mock req and res objects
    req = {
      body: {
        username: "newuser",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    // jest.unmock("../database/connect");
    jest.resetModules();
  });

  // Closes db connection, frees up resources
  // afterAll(async () => {
  //   await connection.close();
  //   jest.clearAllMocks();
  // });

  test("should return 201 when user is successfully created", async () => {
    const { createUser } = require("../controllers/userController");
    
    await createUser(req, res);

    const { getDb } = require("../database/connect");
    expect(getDb).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ userId: "mockedUserId" });
  });

  test("should return 409 when username already exists", async () => {
    const { createUser } = require("../controllers/userController");
    
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue({ username: "newuser" }), // Existing user
        insertOne: jest.fn(), // Should not be called
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Username already exists" });
    expect(mockDb.collection("users").insertOne).not.toHaveBeenCalled();
  });

  test("should return 500 when database insert fails", async () => {
    const { createUser } = require("../controllers/userController");
    
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockRejectedValue(new Error("Database error")),
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining("An error occurred:") });
  });
});


// ########################
// Testing HTTP 500 Errors
// ########################
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

  test("Should return 500 if createUser fails", async () => {
    const { createUser } = require("../controllers/userController");

    // Mock Express req and res objects
    const req = { 
      params: { 
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
    await createUser(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if loginUser fails", async () => {
    const { loginUser } = require("../controllers/userController");

    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b", 
      }, 
      body: {
        userName: "mockUser",
        password: "password",
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await loginUser(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({ 
      "error": "An error occurred: Failed to connect to MongoDB."
    });
  });

  test("Should return 500 if logoutUser fails", async () => {
    const { logoutUser } = require("../controllers/userController");

    // Mock Express req and res objects
    const req = {
      session: {
        destroy: jest.fn((callback) => callback()) 
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await logoutUser(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({ 
      "error": "An error occurred: res.clearCookie is not a function"
    });
  });

  test("Should return 500 if getUserByUsername fails", async () => {
    const { getUserByUsername  } = require("../controllers/userController");

    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        username: "mockUser", 
      },
      user: {
        username: "mockUser"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getUserByUsername(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

test("Should return 500 if updateUser fails", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock username parameter
        username: "mockUser", 
      }, 
      user: {
        // Mock user parameter
        username: "user", 
      }, 
      body: {
        userName: "mockUser",
        password: "password",
        firstName: "first",
        lastName: "last",
        email: "testG@example.com",
        phone: "555-555-5555",
        address: "123 Mock Street",
        city: "Mock City",
        state: "AB", 
        zip: "55555", 
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { updateUser } = require("../controllers/userController");

    // Call the function with the mocked req/res values
    await updateUser(req, res);
  
    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });

  test("Should return 500 if deleteUser fails", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock username parameter
        username: undefined, 
      }, 
      user: {
        // Mock user parameter
        username: undefined, 
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteUser } = require("../controllers/userController");

    // Call the function with the mocked req/res values
    await deleteUser(req, res);
  
    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred: Failed to connect to MongoDB.",
    });
  });
});

// #######################
// Test login user
// #######################
describe("Test loginUser error codes", () => {
  let req, res;
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn(),
    }));
  });

  beforeEach(() => {
    const mockInsertResponse = { acknowledged: true, insertedId: "mockedUserId" };
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(null), // No existing user
        insertOne: jest.fn().mockResolvedValue(mockInsertResponse), // Successful insert
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    req = {
      body: {
        username: "mockUser",
        password: "mockPassword",
      },
      session: {}, // Mock session object
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("should return 200 and login user with valid credentials", async () => {
    const mockUser = {
      _id: "mockUserId",
      username: "mockUser",
      password: "mockPassword",
    };

    const mockToken = "mock.jwt.token";

    // Mock database and jwt behavior
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(mockUser),
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    jwt.sign.mockReturnValue(mockToken);

    const { loginUser } = require("../controllers/userController");

    await loginUser(req, res);

    // Ensure correct collection is called
    expect(mockDb.collection).toHaveBeenCalledWith("users");
    // Ensure 200 response
    expect(req.session.user).toEqual(mockUser);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return 401 if username does not exist", async () => {
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(null), // No user found
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    const { loginUser } = require("../controllers/userController");

    await loginUser(req, res);

    // Assert response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("should return 401 if password is incorrect", async () => {
    const mockUser = {
      _id: "mockUserId",
      username: "testuser",
      password: "wrongpassword", // Incorrect password in mock user
    };

    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(mockUser),
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    const { loginUser } = require("../controllers/userController");

    await loginUser(req, res);

    // Assert response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
  });

  test("should return 500 if a server error occurs", async () => {
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockRejectedValue(new Error("Database error")),
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    const { loginUser } = require("../controllers/userController");

    await loginUser(req, res);

    // Assert response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("An error occurred:"),
    });
  });
});

// #######################
// Test logout user
// #######################
describe("Testing logoutUser error codes", () => {
  let req, res;

  beforeEach(() => {
    req = {
      session: {
        destroy: jest.fn(),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and clear session if logout is successful", () => {
    req.session.destroy.mockImplementationOnce((callback) => callback(null)); // No error
    
    const { logoutUser } = require("../controllers/userController");

    logoutUser(req, res);

    // Verify destroy is called
    expect(req.session.destroy).toHaveBeenCalled();

    // Verify clearCookie and response
    expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
  });

  test("should return 500 if session destroy fails", () => {
    req.session.destroy.mockImplementationOnce((callback) =>
      callback(new Error("Destroy failed"))
    );

    const { logoutUser } = require("../controllers/userController");

    logoutUser(req, res);

    // Confirm end of session
    expect(req.session.destroy).toHaveBeenCalled();

    // Confirm 500 error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Logout failed" });
  });

  test("should handle unexpected errors gracefully", async () => {
    req.session.destroy.mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const { logoutUser } = require("../controllers/userController");

    await logoutUser(req, res);

    // Confirm 500 error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("An error occurred:"),
    });
  });
});

// ###################################
// Testing getUserByUsername 200 & 404
// ###################################
describe("Testing getUserByUsername error codes", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { username: "testuser" }, // Simulate the requested username
      user: { username: "testuser" },  // Simulate the logged-in user
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test("should return 200 with user data if user is found", async () => {
    const mockUser = {
      _id: "mockUserId",
      username: "testuser",
      email: "testuser@example.com",
    };

    // Mock database behavior
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(mockUser), // User found
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    const { getUserByUsername } = require("../controllers/userController");

    await getUserByUsername(req, res);

    // Verify database interaction
    expect(mockDb.collection).toHaveBeenCalledWith("users");

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  test("should return 404 if user is not found", async () => {
    // Mock database behavior
    const mockDb = {
      collection: jest.fn(() => ({
        findOne: jest.fn().mockResolvedValue(null), // User not found
      })),
    };
    require("../database/connect").getDb.mockReturnValue(mockDb);

    const { getUserByUsername } = require("../controllers/userController");

    await getUserByUsername(req, res);

    // Verify database interaction
    expect(mockDb.collection).toHaveBeenCalledWith("users");

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found." });
  });
});


// ###################################
// Testing getSession
// ###################################
describe("Testin getSession functionality", () => {
  test("should return the user from request", () => {
    const mockUser = { username: "mockUser", email: "mockuser@example.com" };

    // Mock request object
    const req = {
      session: {
        user: mockUser,
      },
    };

    const { getSession } = require("../controllers/userController");

    const result = getSession(req);

    // Confirm matching results
    expect(result).toEqual(mockUser);
  });

  test("should return undefined no user", () => {
    const req = {
      // Empty session
      session: {}, 
    };

    const { getSession } = require("../controllers/userController");

    const result = getSession(req);

    // Confirm no matching result
    expect(result).toBeUndefined();
  });
});