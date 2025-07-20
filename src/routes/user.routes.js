const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const authenticate = require("../middle-ware/authenticate.js");

router.get("/profile", userController.getUserProfile);
router.get("/", authenticate, userController.getAllUsers);
router.patch("/me", authenticate,  userController.editUser)

module.exports = router;
