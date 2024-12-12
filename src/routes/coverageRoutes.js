// Import the express module
const express = require("express");
// Create a new router object
const routes = express.Router();

// Import the coverage controller module
const routeCoverage = require("../controllers/coverageController");

// Set up coverage routes
routes.get("/", routeCoverage.getAllCoverage);
routes.get("/:id", routeCoverage.getCoverageById);
routes.post("/", routeCoverage.createCoverage);
routes.put("/:id", routeCoverage.updateCoverage);
routes.delete("/:id", routeCoverage.deleteCoverage);

// Export the routes object
module.exports = routes;