const express = require("express");
const mongoose = require("mongoose");
const mongoDB = require("./database/connect");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const categoryRoutes = require("./routes/category");
const itemRoutes = require("./routes/itemRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// json request are accessible at req.body
app.use(express.json());

app
  .use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use("/category", categoryRoutes)
  .use("/item", itemRoutes)
  .use("/", require("./src/routes"));

// Connect to MongoDB
mongoDB.connectDb();

app.listen(process.env.PORT || port, () => {
  console.log("Web Server is listening at port " + (process.env.PORT || port));
});
