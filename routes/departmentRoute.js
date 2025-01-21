const express = require("express");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

// Get all departments
router.get("/", departmentController.getAllDepartments);

// Get a single department by ID
router.get("/:id", departmentController.getDepartment);

// Create a new department
router.post("/", departmentController.createDepartment);

// Update a department by ID
router.put("/:id", departmentController.updateDepartment);

// Delete a department by ID
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
