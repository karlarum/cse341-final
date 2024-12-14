// Create a new router object using the express framework
const router = require("express").Router();

// Import session validation middleware
const { ensureAuthenticated } = require("../src/session");

// Apply `ensureAuthenticated` middleware to all routes
router.use(ensureAuthenticated);

// Set up routes
router.use("/category", require("./categoryRoutes"));
router.use("/item", require("./itemRoutes"));
router.use("/user", require("./userRoutes"));

// Exports router object
module.exports = router;

// Set up other routes
// router.use("/category", require("./categoryRoutes"));
// router.use("/item", require("./itemRoutes"));
// router.use("/user", require("./userRoutes"));
