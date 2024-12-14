// Create a new router object using the express framework
const router = require("express").Router();

// Set up Swagger subroute
// router.use("/", require("./swagger"));

// Import session validation middleware
const { ensureAuthenticated } = require("../src/session");

// Set up other routes
// router.use("/category", require("./categoryRoutes"));
// router.use("/item", require("./itemRoutes"));
// router.use("/user", require("./userRoutes"));

router.use("/category", require("./catergoryRoutes"));
router.use("/item", require("./itemRoutes"));
router.use("/user", require("./userRoutes"));

// Exports router object
module.exports = router;
