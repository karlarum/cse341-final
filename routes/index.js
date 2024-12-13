// Create a new router object using the express framework
const router = require("express").Router();

// Set up Swagger subroute
router.use("/", require("./swagger"));

// Import session validation middleware
const { ensureAuthenticated } = require('../src/session');

// Set up other routes 
router.use("/category", ensureAuthenticated, require("./catergoryRoutes"));
router.use("/item", ensureAuthenticated, require("./itemRoutes"));
router.use("/user", require("./userRoutes"));
router.use("/coverage", ensureAuthenticated, require("./coverageRoutes"));

// Exports router object 
module.exports = router;