const express = require("express");
const mongoose = require("mongoose");
const mongoDB = require("./database/connect");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
mongoDB.connectDb();

app.listen(process.env.PORT || port, () => {
  console.log("Web Server is listening at port " + (process.env.PORT || port));
});
