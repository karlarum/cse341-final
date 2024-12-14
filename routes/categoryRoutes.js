const express = require("express");
const categoryController = require("../controllers/categoryController");
const router = express.Router();

// Import validator module
const {
  categoryValidation,
  idValidation,
  validate,
} = require("../src/middleware/validator/validator.js");

// GET localhost:8080/category
router.get("/", categoryController.getCategories);

// GET localhost:8080/category/:id
router.get(
  "/:id",
  idValidation(),
  validate,
  categoryController.getCategoryById
);

// POST localhost:8080/category
router.post(
  "/",
  categoryValidation(),
  validate,
  categoryController.createCategory
);

// PUT localhost:8080/category/:id
router.put(
  "/:id",
  [idValidation(), categoryValidation()],
  validate,
  categoryController.updateCategory
);

// DELETE localhost:8080/category/:id
router.delete(
  "/:id",
  idValidation(),
  validate,
  categoryController.deleteCategory
);

module.exports = router;
