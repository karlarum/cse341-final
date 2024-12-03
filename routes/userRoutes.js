const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logoutUser);
router.get("/:username", userController.getUserByUsername);
router.put("/:username", userController.updateUser);
router.delete("/:username", userController.deleteUser);


module.exports = router;