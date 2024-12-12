// Import connectDb to initialize the database
const { connectDb, getDb } = require("../database/connect");

// Import Supertest HTTP library
const request = require("supertest");
// Import the express library
const express = require("express");

// Set baseURL for testing, not needed with Supertest
// const baseURL = "http://localhost:3000";

/* Import MongoClient class from mongodb library. Allows access to mongodb database. */
const { MongoClient, ObjectId } = require("mongodb");
// Import routes index where subroutes are defined
const routes = require("../src/routes/index");

// Create instance of express
const app = express();
// Parse JSON through req.body
app.use(express.json());
// Use routes module for requests to root "/"
app.use("/", routes);

describe("Tests for connectDb function", () => {
  afterEach(() => {
    // Reset mocks and restore the original implementation
    jest.resetModules();
  });

  test("Should throw error when client not initialized", async () => {
    const { connectDb } = require("../database/connect");
  
    // Call connectDb with undefined client
    await expect(connectDb(undefined)).rejects.toThrowError("MongoClient instance is required");
  });  
});

describe("Tests for connectDb function", () => {
  let spyConsoleErr;

  beforeEach(() => {
    // Mock console.error to track its calls
    spyConsoleErr = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    // Restore the mock after each test
    jest.clearAllMocks();
    spyConsoleErr.mockRestore();
    jest.unmock("mongodb"); // Ensure no lingering mocks
  });

  test("Should handle MongoClient creation failure", async () => {
    // Mock case: MongoClient creation fails
    jest.mock("mongodb", () => {
      const originalModule = jest.requireActual("mongodb");
      return {
        ...originalModule,
        MongoClient: jest.fn(() => {
          throw new Error("MongoClient creation failed");
        }),
      };
    });

    const { connectDb } = require("../database/connect");

    await connectDb("team");

    // Verify console.error was called
    expect(spyConsoleErr).toHaveBeenCalledWith(
      "Failed to connect to MongoDB",
      expect.any(Error)
    );
  });

  // test("Should handle connection refused error", async () => {
  //   // Mock case: Connection refused
  //   jest.mock("mongodb", () => {
  //     const originalModule = jest.requireActual("mongodb");
  //     return {
  //       ...originalModule,
  //       MongoClient: jest.fn(() => ({
  //         connect: jest.fn(() => {
  //           throw new Error("Connection refused on port");
  //         }),
  //       })),
  //     };
  //   });

  //   const { connectDb } = require("../database/connect");

  //   await connectDb("team");

  //   // Verify console.error was called
  //   expect(spyConsoleErr).toHaveBeenCalledWith(
  //     "Failed to connect to MongoDB",
  //     expect.any(Error)
  //   );
  // });

  // test("Should handle generic connection failure", async () => {
  //   // Mock case: Generic connection failure
  //   jest.mock("mongodb", () => {
  //     const originalModule = jest.requireActual("mongodb");
  //     return {
  //       ...originalModule,
  //       MongoClient: jest.fn(() => ({
  //         connect: jest.fn(() => {
  //           throw new Error("Generic connection failure");
  //         }),
  //       })),
  //     };
  //   });

  //   const { connectDb } = require("../database/connect");

  //   await connectDb("team");

  //   // Verify console.error was called
  //   expect(spyConsoleErr).toHaveBeenCalledWith(
  //     "Failed to connect to MongoDB",
  //     expect.any(Error)
  //   );
  // });
});

describe("Tests for getDb function", () => {
  afterEach(() => {
    // Reset mocks and restore the original implementation
    jest.resetModules();
  });

  // test("Should return the database instance when db is initialized", () => {
  //   /* Override db variable by mocking the module in ../database/connect where getDb is located. */
  //   jest.mock("../database/connect", () => {
  //     /* Import the real connect.js module to load other functions not being tested, test only replaces db. */
  //     const originalModule = jest.requireActual("../database/connect");
  //     /* Returns all og exports from connect.js (connectDb, getDb, etc.), replaces db with mocked value. */
  //     return {
  //     // ret connect.js exports, replaces db export w/mock db
  //       ...originalModule,
  //       db: { mockDb: "initialized" }, // Simulate initialized db
  //     };
  //   });

  //   // Re-import mocked connect.js module w/initialized db
  //   const { getDb } = require("../database/connect");
  //   // Calls getDb function, should return initialized
  //   const dbInstance = getDb();
  //   expect(dbInstance).toEqual({ mockDb: "initialized" });
  // });

  test("Should throw an error when db is not initialized", () => {
    // Replace db variable with mocked version
    jest.mock("../database/connect", () => {
      // Import real mod in connect.js, but replace db
      const ogModule = jest.requireActual("../database/connect");
      // ret connect.js exports, replaces db export w/mock db
      return {
        ...ogModule,
      // Replace w/undefined to test when db not initialized
        db: undefined, // Simulate uninitialized db
      };
    });

    // Re-import mocked connect.js module to use undefined db
    const { getDb } = require("../database/connect");
    // Call getDb, which throws error because db is undefined
    expect(() => getDb()).toThrowError(
      "Database not initialized. Call connectDb first."
    );
  });
});

describe("Tests for /coverage routes", () => {
  let connection;
  let db;
  let result;
  let lastResult;

  /* Jest lifecycle method runs once before all tests in test file. Set up connection var by connecting to MongoDB. Assigns database to the db var. The global var __MONGO_URI__ is dynamically created and provided by the in-memory MongoDB setup. */
  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    try {
      // console.log("MongoDB URI:", global.__MONGO_URI__);
      await connectDb(connection);
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error; // Ensure Jest is aware of the failure
    }
  });

  /* Jest lifecycle method, runs once after all tests in file have completed. Closes db connection, frees up resources, prevents memory leaks. */
  afterAll(async () => {
    await connection.close();
    jest.clearAllMocks(); // Clear any mock behavior
  });
  
  beforeEach(async () => {
    const db = getDb();
    // console.log("DBNAME BEFOREEACH: ", db.databaseName);
    // Clear the collection before adding data
    await db.collection("coverage").deleteMany({});

    // Add mock entries to the database
    result = await db.collection("coverage").insertMany([
      {
        name: "Coverage A",
        insuranceCompany: "Company A",
        policyNumber: "000001",
        coverageInfo: "testA", 
        contactNumber: "555-555-5551", 
        email: "testA@example.com", 
        creationDate: "0000-00-01", 
        renewalDate: "0001-00-01"
      },
      {
        name: "Coverage B",
        insuranceCompany: "Company B",
        policyNumber: "000002",
        coverageInfo: "testB", 
        contactNumber: "555-555-5552", 
        email: "testB@example.com", 
        creationDate: "0000-00-02", 
        renewalDate: "0002-00-02"
      },
    ]);

    lastResult = result.insertedIds[0].toString();

    // Log the insertion result to verify
    // console.log("Inserted documents:", result);

    // const collections = await db.listCollections().toArray();
    // console.log("Collections in database:", collections);

    // Ensure data seeded properly
    const docs = await db.collection("coverage").find().toArray();
    // console.log("DOCS INSERTED: ", docs);
    // console.log("LASTRESULT _ID: ", lastResult);
  
    expect(docs).toHaveLength(2);
    expect(docs[0]).toMatchObject({
      name: "Coverage A",
      insuranceCompany: "Company A",
      policyNumber: "000001",
      coverageInfo: "testA", 
      contactNumber: "555-555-5551", 
      email: "testA@example.com", 
      creationDate: "0000-00-01", 
      renewalDate: "0001-00-01", 
    });
    expect(docs[1]).toMatchObject({
      name: "Coverage B",
      insuranceCompany: "Company B",
      policyNumber: "000002",
      coverageInfo: "testB", 
      contactNumber: "555-555-5552", 
      email: "testB@example.com", 
      creationDate: "0000-00-02", 
      renewalDate: "0002-00-02"
    });
  });

  // Clear all database collections after each test
  afterEach(async () => {
    const db = getDb();
    // console.log("DBNAME AFTEREACH: ", db.databaseName);
    const allDocs = await db.collection("coverage").find().toArray();
    // console.log("Documents before clearing:", allDocs);
    await db.collection("coverage").deleteMany({});
    jest.clearAllTimers();
  });
// });

// describe("Tests for /coverage routes", () => {
  test("Return all coverage records", async () => {
    const res = await request(app).get("/coverage");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      name: "Coverage A",
      insuranceCompany: "Company A",
      policyNumber: "000001",
      // coverageInfo: "testA", 
      // contactNumber: "555-555-5551", 
      // email: "testA@example.com", 
      // creationDate: "0000-00-01", 
      // renewalDate: "0001-00-01"
    });
    expect(res.body[1]).toMatchObject({
      name: "Coverage B",
      insuranceCompany: "Company B",
      policyNumber: "000002",
      // coverageInfo: "testB", 
      // contactNumber: "555-555-5552", 
      // email: "testB@example.com", 
      // creationDate: "0000-00-02", 
      // renewalDate: "0002-00-02"
    });
  });

  test("Return a coverage record by id", async () => {
    const id1 = result.insertedIds[0].toString();
    const res = await request(app).get(`/coverage/${id1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: "Coverage A",
      insuranceCompany: "Company A",
      policyNumber: "000001",
      coverageInfo: "testA", 
      contactNumber: "555-555-5551", 
      email: "testA@example.com", 
      creationDate: "0000-00-01", 
      renewalDate: "0001-00-01"
    });
  });

  test("/coverage/:id should return 404 if no record", async () => {
    const res = await request(app).get("/coverage/f4bbbd477893a92451bdf7d6");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Search failed. No record found." });
  });

  test("Add new coverage record", async () => {
    const newBus = {
      // _id: new ObjectId("c4bbbd477893a92451bdf7d3"),
      name: "Coverage C",
      insuranceCompany: "Company C",
      policyNumber: "000003",
      coverageInfo: "testC", 
      contactNumber: "555-555-5553", 
      email: "testC@example.com", 
      creationDate: "2024-01-03", 
      renewalDate: "2025-01-03"
    };

    const db = getDb();
    // console.log("DBNAME BEFOREPOST: ", db.databaseName);

    // Log before POST
    // const allBeforePost = await db.collection("coverage").find().toArray();
    // console.log("All documents BEFORE POST:", allBeforePost);

    // Add the new record to the database
    const res = await request(app)
      .post("/coverage")
      .send(newBus);

    // Log after POST
    // const allAfterPost = await db.collection("coverage").find().toArray();
    // console.log("All documents after POST:", allAfterPost);

    // Store the id of new record
    lastResult = res.body.id;
    // console.log("NEW RECORD ID: ", lastResult);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      "id": lastResult,
      "message": "Coverage record created successfully.",
    });

    // Log before query
    // const allBeforeQuery = await db.collection("coverage").find().toArray();
    // console.log("All documents before query:", allBeforeQuery);
    // Confirm the record was added to the database
    const chkBus = await db.collection("coverage").findOne({ _id: new ObjectId(lastResult) });
    // console.log("CHECKBUS: ", chkBus);
    // console.log("NEWBUS: ", newBus);
    expect(chkBus).toMatchObject(newBus);
  });

  test("/coverage/:id should return 404 if no record", async () => {
    const invalidData = {
      // Missing "name" field
      insuranceCompany: "Company C", 
      policyNumber: "000003",
      coverageInfo: "testC",
      contactNumber: "555-555-5553",
      email: "testC@example.com",
      creationDate: "2024-01-03",
      renewalDate: "2025-01-03"
    };

    const res = await request(app)
      .post("/coverage")
      // Sending incomplete data
      .send(invalidData);

    expect(res.statusCode).toBe(422);
    expect(res.body).toHaveProperty("errors");
    // expect(res.body).toEqual({ error: "Bad request: An error occurred while creating record." });
  });

  test("Update existing coverage record", async () => {
    const db = getDb();

    const idToUpdate = result.insertedIds[0].toString();
    // console.log("IDTOUPDATE: ", idToUpdate);

    // const docsAfterInsert = await db.collection("coverage").find().toArray();
    // console.log("Documents after insert:", docsAfterInsert);

    const updateBus = {
      name: "Coverage Updated",
      insuranceCompany: "Company Updated",
      policyNumber: "333333",
      coverageInfo: "Updated policy description", 
      contactNumber: "555-555-5533", 
      email: "testC3@example.com", 
      creationDate: "2024-12-03", 
      renewalDate: "2025-12-03"
    };
    // lastResult = result.insertedIds[0].toString();
    // console.log("INSERTEDIDS: ", result.insertedIds);
    // console.log("LAST RESULT: ", lastResult);

    // Update the record in the database
    const res = await request(app)

      // .put("/coverage/c4bbbd477893a92451bdf7d3")
      .put(`/coverage/${idToUpdate}`)
      .send(updateBus);
      // console.log("RESPONSE: ", res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ 
        message: "Insurance coverage successfully updated." 
      });

    // Confirm the record was updated in the database
    const chkBus = await db.collection("coverage")
      .findOne({ _id: new ObjectId(idToUpdate) })
    // console.log("UPDATED RECORD: ", chkBus);

    expect(chkBus).toMatchObject(updateBus);
  });

  test("delete a coverage record", async () => {
    const res = await request(app).delete(`/coverage/${lastResult}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Insurance coverage successfully deleted." });

    // Verify the record was removed from the database
    const record = await db.collection("coverage")
      .findOne({ _id: new ObjectId(lastResult) });
    expect(record).toBeNull();
  });
});

// describe("Test for /coverage error responses", () => {
//   // let connection;
//   let db;
//   // let result;

//   /* Set up connection var to MongoDB. Assign team database to the db var. */
//   beforeAll(async () => {
//     connection = await MongoClient.connect(global.__MONGO_URI__);
//     // Connect to team database explicitly
//     db = await connection.db("team");
//     // db = await connectDb("team");

//     try {
//       await connectDb(connection);
//     } catch (error) {
//       console.error("Failed to initialize database:", error);
//       throw error; // Ensure Jest is aware of the failure
//     }
//   });

//   /* Jest lifecycle method, runs once after all tests in file have completed. Closes db connection, frees up resources, prevents memory leaks. */
//   afterAll(async () => {
//     await db.close();
//     jest.clearAllMocks(); // Clear any mock behavior
//   });
  
//   beforeEach(async () => {
//     // Replace db variable with mocked version
//     jest.mock("../database/connect", () => {
//       // Import real mod in connect.js, but replace db
//       const ogModule = jest.requireActual("../database/connect");
//       // ret connect.js exports, replaces db export w/mock db
//       return {
//         ...ogModule,
//       // Replace w/undefined to test when db not initialized
//         db: 500, // Simulate uninitialized db
//       };
//     });
//     // const db = getDb();
//     // console.log("DBNAME BEFOREEACH: ", db.databaseName);
//     // Clear the collection before adding data
//     // await db.collection("coverage").deleteMany({});
//   });

//   // Clear all database collections after each test
//   afterEach(async () => {
//     // Reset mocks and restore og models
//     jest.resetModules();
//   });

//   test("Should return 500 for server error", async () => {
//     // Create a mock id
//     const mockId = new ObjectId().toString(); 

//     // Mock the database call to throw an error
//     // jest.spyOn(db, "collection").mockImplementation(() => {
//     //   return {
//     //     findOne: jest.fn(() => {
//     //       // console.log("Simulated findOne error");
//     //       // throw new Error ("Simulated database error.");
//     //     }),
//     //   };
//     // });
    
//     // Send get request
//     // const res = await request(app).get(`/coverage/${mockId}`);
//     const res = getDb();

//     expect(res.statusCode).toBe(500);
//     expect(res.body).toEqual({ error: "An error occurred while fetching data." });

//     // Remove mocks, restore function to original state
//     jest.restoreAllMocks();
//   });
// })

describe("Test getAllCoverage for error responses", () => {
  let spyConsoleErr;

  beforeEach(() => {
    // Mock console.error to track its calls
    spyConsoleErr = jest.spyOn(console, "error").mockImplementation();

    // Resets the module registry
    jest.resetModules();

    // Mock causes mongodb.getDb to throw an error
    jest.mock("../database/connect", () => ({
      getDb: jest.fn(() => {
        throw new Error("Failed to connect to MongoDB.");
      }),
    }));
  });

  afterEach(() => {
    /* Prevent mock from being applied automatically, but won't retroactively remove mock if it has been loaded. */
    jest.unmock("../database/connect");
    // Resets the module registry
    jest.resetModules();
    // Clears mock call history, doesn't restore module state
    jest.clearAllMocks();
    
    // 
    spyConsoleErr.mockRestore();
  });

  test("Should return 500 if getAllCoverage fails", async () => {
    const { getAllCoverage } = require("../src/controllers/coverageController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getAllCoverage(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to get records.",
    });

    // Verify that console.error was called
    expect(spyConsoleErr).toHaveBeenCalledWith(
      expect.stringContaining("Error getting all coverages: "),
      expect.any(Error)
    );
  });
});

describe("Test getAllCoverage for getDb failure 500", () => {
  let spyConsoleErr;

  beforeEach(() => {
    // Mock console.error to track its calls
    spyConsoleErr = jest.spyOn(console, "error").mockImplementation();
    // Reset the module registry
    jest.resetModules();

    // Mock causes mongodb.getDb to return null
    jest.mock("../database/connect", () => ({
      // getDb returns null, simulates db connection failure
      getDb: jest.fn(() => null),  
    }));
  });

  afterEach(() => {
    /* Prevent mock from being applied automatically, but won't retroactively remove mock if it has been loaded. */
    jest.unmock("../database/connect");
    // Resets the module registry
    jest.resetModules();
    // Clears mock call history, doesn't restore module state
    jest.clearAllMocks();
    
    // 
    spyConsoleErr.mockRestore();
  });

  test("Should return 500 if getDb fails in getAllCoverage", async () => {
    const { getAllCoverage } = require("../src/controllers/coverageController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await getAllCoverage(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Database connection failed.",
    });

    // Verify that console.error was called
    expect(spyConsoleErr).toHaveBeenCalledWith(
      expect.stringContaining("Database connection is null or undefined.")
    );
  });
});

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

  test("Should return 500 if getCoverageById fails", async () => {
    const { getCoverageById } = require("../src/controllers/coverageController");

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
    await getCoverageById(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while fetching data.",
    });
  });

  test("Should return 500 if createCoverage fails", async () => {
    const { createCoverage } = require("../src/controllers/coverageController");

    // Mock Express req and res objects
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await createCoverage(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while attempting to create record.",
    });
  });

  test("Should return 500 if updateCoverage fails", async () => {
    const { updateCoverage } = require("../src/controllers/coverageController");

    // Mock Express req and res objects
    const req = { params: { id: "6759d95c78b34f58d00456ba" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await updateCoverage(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to update record.",
    });
  });

  test("Should return 500 if deleteCoverage fails", async () => {
    const { deleteCoverage } = require("../src/controllers/coverageController");

    // Mock Express req and res objects
    const req = { params: { id: "6759d95c78b34f58d00456ba" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the function with the mocked req/res values
    await deleteCoverage(req, res);

    // Test that res.status is called with 500
    expect(res.status).toHaveBeenCalledWith(500);
    // Test that res.json is called with correct message
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to delete record.",
    });
  });
});

describe("Tests coverage controllers for valid ObjectId", () => {  
  afterEach(() => {
    // Restore mocks
    jest.clearAllMocks();
    // Remove mock so other tests are not affected
    jest.unmock("../database/connect");
    jest.resetModules();
  });

  test("Should return 400 if update ObjectID is invalid", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: null, 
      }, 
      body: {
        name: "Coverage Z",
        insuranceCompany: "Company Z",
        policyNumber: "999999",
        coverageInfo: "testZ", 
        contactNumber: "555-555-9999", 
        email: "testZ@example.com", 
        creationDate: "0000-00-09", 
        renewalDate: "0001-00-09"
      }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { updateCoverage } = require("../src/controllers/coverageController");
    
    // Call the function with the mocked req/res values
    await updateCoverage(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please use a valid ID.",
    });
  });

  test("Should return 400 if delete ObjectID is invalid", async () => {
    // Mock database to avoid interference with other tests
    // jest.mock("../database/connect", () => ({
    //   getDb: jest.fn(() => ({
    //     collection: jest.fn(() => ({
    //       deleteOne: jest.fn(),
    //     })),
    //   })),
    // }));
  
    // const invalidId = "invalid-id";
    // // Call the API endpoint
    // const res = await request(app).delete(`/coverage/${invalidId}`);

    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: null, 
      },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteCoverage } = require("../src/controllers/coverageController");

    // Call the function with the mocked req/res values
    await deleteCoverage(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please use a valid id.",
    });
  });
});

describe("Tests deleteCoverage controller for valid record not in database", () => {
  let connection;
  let db;

  /* Set up connection to MongoDB. The global var __MONGO_URI__ is provided by in-memory MongoDB setup. */
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

  test("Should return 404 if record does not exist when deleting coverage", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b", 
      }, 
      body: {
        name: "Coverage G",
        insuranceCompany: "Company G",
        policyNumber: "000007",
        coverageInfo: "testG",
        contactNumber: "555-555-5557",
        email: "testG@example.com",
        creationDate: "0000-00-07",
        renewalDate: "0002-00-07"
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { deleteCoverage } = require("../src/controllers/coverageController");

    // Call the function with the mocked req/res values
    await deleteCoverage(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Insurance coverage not found.",
    });
  });
});

describe("Tests updateCoverage controller for valid record not in database", () => {
  let connection;
  let db;

  /* Set up connection to MongoDB. The global var __MONGO_URI__ is provided by in-memory MongoDB setup. */
  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          replaceOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
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

  test("Should return 404 if record does not exist when updating coverage", async () => {
    // Mock Express req and res objects
    const req = {
      params: {
        // Mock valid ObjectId
        id: "6759f2d2b7aaf3eb2152c14b", 
      }, 
      body: {
        name: "Coverage G",
        insuranceCompany: "Company G",
        policyNumber: "000007",
        coverageInfo: "testG",
        contactNumber: "555-555-5557",
        email: "testG@example.com",
        creationDate: "0000-00-07",
        renewalDate: "0002-00-07"
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { updateCoverage } = require("../src/controllers/coverageController");

    // Call the function with the mocked req/res values
    await updateCoverage(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "No coverage found with the given ID.",
    });
  });
});

describe("Tests createCoverage controller for validity", () => {
  let connection;
  let db;

  /* Set up connection to MongoDB. The global var __MONGO_URI__ is provided by in-memory MongoDB setup. */
  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    // Connect to team database explicitly
    db = await connection.db("team");

    jest.mock('../database/connect', () => ({
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn().mockResolvedValue({ insertedId: null })
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

  test("Should return 400 if record does not exist when creating coverage", async () => {
    // Mock Express req and res objects
    const req = { 
      body: {
        name: "Coverage G",
        insuranceCompany: "Company G",
        policyNumber: "000007",
        coverageInfo: "testG",
        contactNumber: "555-555-5557",
        email: "testG@example.com",
        creationDate: "0000-00-07",
        renewalDate: "0002-00-07"
      }, 
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const { createCoverage } = require("../src/controllers/coverageController");

    // Call the function with the mocked req/res values
    await createCoverage(req, res);
  
    // Verify that the invalid ID is handled correctly
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Bad request: An error occurred while creating record.",
    });
  });
});