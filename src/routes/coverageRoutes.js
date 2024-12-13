// Import the express module
const express = require("express");
// Create a new router object
const routes = express.Router();

// Import the coverage controller module
const routeCoverage = require("../controllers/coverageController");

// Import validator controller module
const { coverageValidation, idValidation, validate } = require("../middleware/validator/validator");

// Set up coverage routes
routes.get("/", routeCoverage.getAllCoverage);
routes.get("/:id", idValidation(), validate, routeCoverage.getCoverageById);
routes.post("/", coverageValidation(), validate, routeCoverage.createCoverage);
routes.put("/:id", coverageValidation(), validate, routeCoverage.updateCoverage);
routes.delete("/:id", idValidation(), validate, routeCoverage.deleteCoverage);

// Export the routes object
module.exports = routes;