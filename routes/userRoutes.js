const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const { ensureAuthenticated } = require("../src/session");
require("dotenv").config();

router.post("/", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/auth", (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user`;
    res.redirect(redirectUrl);
});
router.get("/auth/callback", userController.authUserCallback);

router.use(ensureAuthenticated);

router.get("/logout", userController.logoutUser);
router.get("/:username", userController.getUserByUsername);
router.put("/:username", userController.updateUser);
router.delete("/:username", userController.deleteUser);


module.exports = router;