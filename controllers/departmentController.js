const Department = require("../models/departmentModel");

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({
      status: "success",
      results: departments.length,
      data: {
        departments,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get a single department by ID
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "No department found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        department,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const newDepartment = await Department.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        department: newDepartment,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update a department by ID
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "No department found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        department,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete a department by ID
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({
        status: "fail",
        message: "No department found with that ID",
      });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
