const express = require("express");
const userController = require("../controllers/userController");
const checkApproval = require("../middleWares/checkUserApprovalStatus");
const verifyToken = require("../middleWares/tokenVer");

const router = express.Router();

// Define routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/updateUser/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/login", userController.loginUser);
router.put("/approveUser/:id", userController.approveUser);

module.exports = router;
