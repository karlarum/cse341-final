const express = require("express");
const categoryController = require("../controllers/category");
const router = express.Router();

//GET localhost:8080/category
router.get("/", categoryController.getCategories);

// GET localhost:8080/category/:id
router.get("/:id", categoryController.getCategoryById);

//Route to create a new task. All fields required. Return new task id in response body
router.post("/", categoryController.createCategory);

//Update task. This route should allow for a url similar to this: api-url-path/category/id-to-modify.
router.put("/:id", categoryController.updateCategory);

//Delete task. Return https status code showing deletion as successful
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
