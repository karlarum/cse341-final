// Import the express module
const router = require("express").Router();
// Import the Swagger Express module
const swaggerUi = require("swagger-ui-express");
// Import Swagger JSON configuration
const swaggerDoc = require("../../swagger.json");
// Set up Swagger Express API
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
// Export the swagger route
module.exports = router;