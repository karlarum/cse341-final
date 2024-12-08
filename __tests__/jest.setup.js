// Import connectDb to initialize the database
const { connectDb } = require("../database/connect");
// Import the express library
const express = require("express");

// Import Supertest HTTP library
const request = require("supertest");
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
// Mock the swagger route
// jest.mock("../swagger", () => jest.fn());

describe("Tests for /coverage routes", () => {
  let connection;
  let db;

  /* Jest lifecycle method runs once before all tests in test file. Set up connection var by connecting to MongoDB. Assigns database to the db var. The global var __MONGO_URI__ is dynamically created and provided by the in-memory MongoDB setup. */
  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db();
    // Pass the database to the app
    app.locals.db = db;
  });

  /* Jest lifecycle method, runs once after all tests in file have completed. Closes db connection, frees up resources, prevents memory leaks. */
  afterAll(async () => {
    await connection.close();
  });

  // Clear all database collections after each test
  afterEach(async () => {
    // const collections = await db.collections();
    // for (const collection of collections) {
    //   await collection().deleteMany({});
    // }
    await db.collection("coverage").deleteMany({});
  });
// });

// describe("Tests for /coverage routes", () => {
  beforeEach(async () => {
    // Clear the collection before adding data
    await db.collection("coverage").deleteMany({});

    // Add mock entries to the database
    const result = await db.collection("coverage").insertMany([
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

    // Log the insertion result to verify
    console.log("Inserted documents:", result);

    // Fetch the inserted documents to verify
    // const insertedDocs = await db.collection("coverage").find().toArray();
    // console.log("Inserted documents from database:", insertedDocs);
  });

  test("Database seeded correctly", async () => {
    const docs = await db.collection("coverage").find().toArray();
  
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
  

  test("Return all coverage records", async () => {
    const res = await request(app).get("/coverage");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      name: "Coverage A",
      insuranceCompany: "Company A",
      policyNumber: "000001",
      coverageInfo: "testA", 
      contactNumber: "555-555-5551", 
      email: "testA@example.com", 
      creationDate: "0000-00-01", 
      renewalDate: "0001-00-01"
    });
    expect(res.body[1]).toMatchObject({
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

  test("Return a coverage record by id", async () => {
    const res = await request(app).get(`/coverage/${result.insertedIds[0]}`);

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
      creationDate: "0000-00-03", 
      renewalDate: "0003-00-03"
    };

    // Add the new record to the database
    const res = await request(app)
      .post("/coverage")
      .send(newBus);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject(newBus);

    // Confirm the record was added to the database
    const chkBus = await db.collection("coverage").findOne({ name: "Coverage C" });
    expect(chkBus).toMatchObject(newBus);
  });

  test("Update existing coverage record", async () => {
    const updateBus = {
      name: "Coverage C3",
      insuranceCompany: "Company C3",
      policyNumber: "333333",
      coverageInfo: "testC3", 
      contactNumber: "555-555-5533", 
      email: "testC3@example.com", 
      creationDate: "0003-00-03", 
      renewalDate: "0033-00-03"
    };

    // Update the record in the database
    const res = await request(app)
      // .put("/coverage/c4bbbd477893a92451bdf7d3")
      .put(`/coverage/${updateBus.insertedIds[0]}`)
      .send(updateBus);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ 
        acknowledged: true 
      });

    // Confirm the record was updated in the database
    const chkBus = await db.collection("coverage")
      // .findOne({ _id: new ObjectId("c4bbbd477893a92451bdf7d3") });
      .findOne({ _id: new ObjectId `/coverage/${updateBus.insertedIds[0]}` })
    expect(chkBus).toMatchObject(updateBus);
  });

  test("delete a coverage record", async () => {
    const res = await request(app).delete("/coverage/c4bbbd477893a92451bdf7d3");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Coverage deleted successfully." });

    // Verify the record was removed from the database
    const record = await db.collection("coverage")
      .findOne({ _id: new ObjectId("64bbbd477893a92451bdf7d1") });
    expect(record).toBeNull();
  });

  // test("should insert user", async () => {
  //   const coverage = db.collection("coverage");
  
  //   const newBus = {
  //     _id: new ObjectId("c4bbbd477893a92451bdf7d3"),
  //     name: "Coverage C",
  //     insuranceCompany: "Company C",
  //     policyNumber: "000003",
  //     coverageInfo: "testC", 
  //     contactNumber: "555-555-5553", 
  //     email: "testC@example.com", 
  //     creationDate: "0000-00-03", 
  //     renewalDate: "0002-00-03"
  //   };
  //   await coverage.insertOne(newBus);
  
  //   const insertedBus = await coverage.findOne({_id: "c4bbbd477893a92451bdf7d3"});
  //   expect(insertedBus).toEqual(newBus);
  // });
});