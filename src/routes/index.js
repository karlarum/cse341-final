// Create a new router object using the express framework
const router = require("express").Router();

const { ensureAuthenticated } = require("../session");

// Set up Swagger subroute
router.use("/", require("./swagger"));

// Set up other routes 
// router.use("/category", require("./catergoryRoutes"));
// Commented out until routes are set up
// router.use("/item", require("./itemRoutes"));
// router.use("/user", require("./userRoutes"));
// router.use("/coverage", require("./coverageRoutes"));
router.use("/coverage", ensureAuthenticated, require("./coverageRoutes"));

// Exports router object 
module.exports = router;
