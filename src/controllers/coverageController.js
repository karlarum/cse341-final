const mongodb = require("../../database/connect");
const { ObjectId } = require("mongodb");

const getAllCoverage = async (req, res, next) => {
  try {
    // Get reference to db
    const db = mongodb.getDb();

    // Get records in coverage collection
    const coverage = await db.collection("coverage").find().toArray();

    // HTTP successful response with coverage data
    res.status(200).json(coverage);
  } catch (error) {
    res.status(500).json({ error: "Failed to get records." });
  }
}

const getCoverageById = async (req, res, next) => {
  try {
    // // Get reference to db
    const db = mongodb.getDb();
    // Convert id into Mongo ObjectId
    const coverageId = new ObjectId(req.params.id);

    // Run a check to see if the ID is valid
    if (!ObjectId.isValid(coverageId)) {
      return res.status(400).json({ error: "Please use a valid ID." });
    }

    // Search for coverage with matching id
    const coverage = await db
      .collection("coverage")
      .findOne({ _id: coverageId });

    if (!coverage) {
      return res.status(404).json({ error: "Search failed. No record found."});
    }

    // Successful response
    res.status(200).json(coverage);
  } catch (error) {
    // Internal server error
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

const createCoverage = async (req, res, next) => {
  try {
    // Access the form data stored in req.body
    const { 
      name, insuranceCompany, policyNumber, coverageInfo, contactNumber, email, creationDate, renewalDate
    } = req.body;

    const coverageObj = {
      name, insuranceCompany, policyNumber, coverageInfo,  contactNumber, email, creationDate, renewalDate
    }

    // get the MongoDB database instance
    const db = mongodb.getDb();
    // Add the formData to "coverage" collection
    const coverage = await db
      .collection("coverage")
      .insertOne(coverageObj);

    // Successful response
    if (coverage.acknowledged) {
      res.status(201).json({ 
        message: "Coverage record created successfully.", 
        id: coverage.insertedId 
      });
    } else {
      // Bad request
      res.status(400).json({
        error: "Bad request: An error occurred while creating record."
      });
    }
  } catch (error) {
    // Internal server error
    res.status(500).json({ error: "An error occurred while attempting to create record." });
    
  }
}

const updateCoverage = async (req, res, next) => {
  try {
    // Get reference to db
    const db = mongodb.getDb();
    // Convert id into Mongo ObjectId
    const coverageId = req.params.id;

    // Run a check to see if the ID is valid
    if (!ObjectId.isValid(coverageId)) {
      return res.status(400).json({ error: "Please use a valid ID." });
    }

    // Coverage obejct values fetched from body
    const coverageObj = {
      name: req.body.name, 
      insuranceCompany: req.body.insuranceCompany, 
      policyNumber: req.body.policyNumber, 
      coverageInfo: req.body.coverageInfo, 
      contactNumber: req.body.contactNumber, 
      email: req.body.email, 
      creationDate: req.body.creationDate, 
      renewalDate: req.body.renewalDate
    }

    // Access coverage collection
    const collection = db.collection("coverage");

    // Access coverage by id
    const record = await collection
      .findOne({ _id: new ObjectId(coverageId) });

    // Return error is coverage record not found
    if (!record) {
      return res.status(404).json({ error: "Insurance coverage not found." });
    }

    // Update coverage record with coverageObj data
    const coverage = await collection
      .replaceOne({ _id: new ObjectId(coverageId)}, coverageObj);

    // Update successful
    if (coverage.modifiedCount > 0) {
      res.status(200).json({
        message: "Insurance coverage successfully updated."
      });
    } else {
      // Bad request
      res.status(404).json({
        error: "No coverage found with the given ID."
      });
    }
  } catch (error) {
    // Internal server error
    res.status(500).json({ error: "Failed to update record." });
  }
}

const deleteCoverage = async (req, res, next) => {
  try {
    // Get reference to db
    const db = mongodb.getDb();
    // Convert id into Mongo ObjectId
    const id = req.params.id;

    // Check to see if id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Please use a valid id."});
    }

    // Access the coverage collection
    const result = await db
      .collection("coverage")
      .deleteOne({ _id: new ObjectId(id) });

    // Check to see if coverage was deleted
    if (result.deletedCount > 0) {
      // Successful response
      res.status(200).json({ message: "Insurance coverage successfully deleted."});
    } else {
      res.status(404).json({ error: "Insurance coverage not found."}); 
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete record."});
  }
}

// Exports functions 
module.exports = { getAllCoverage, getCoverageById, createCoverage, updateCoverage, deleteCoverage };