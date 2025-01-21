const express = require("express");
const userController = require("../controllers/userController");
const checkApproval = require("../middleWares/checkUserApprovalStatus");
const verifyToken = require("../middleWares/tokenVer");

const router = express.Router();

// Define routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.loginUser);
router.put("/:id", verifyToken, userController.approveUser);

module.exports = router;
