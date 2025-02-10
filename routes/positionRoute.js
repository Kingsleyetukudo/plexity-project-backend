const express = require("express");
const positionController = require("../controllers/positionController");

const router = express.Router();

// Get all departments
router.get("/", positionController.getAllPositions);

// Get a single department by ID
router.get("/:id", positionController.getPosition);

// Create a new department
router.post("/", positionController.createPosition);

// Update a department by ID
router.put("/:id", positionController.updatePosition);

// Delete a department by ID
router.delete("/:id", positionController.deletePosition);

module.exports = router;
