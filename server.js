const express = require("express");
const mongoose = require("mongoose");
const mongoDB = require("./database/connect");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const routes = require("./routes/index");
const session = require("express-session");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;

app.use(express.json());

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app
  .use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use(routes);

// Connect to MongoDB
mongoDB.connectDb();

app.listen(process.env.PORT || port, () => {
  // console.log("Web Server is listening at port " + (process.env.PORT || port));
});
