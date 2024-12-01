const express = require("express");
const itemController = require("../controllers/itemController");
const router = express.Router();

router.get("/", itemController.getItem);
router.get("/:id", itemController.getItemById);
router.post("/", itemController.createItem);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;