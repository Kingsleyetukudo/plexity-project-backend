const Position = require("../models/positionModel");

// Get all departments
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find();
    res.status(200).json({
      status: "success",
      results: positions.length,
      data: {
        positions,
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
exports.getPosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({
        status: "fail",
        message: "No position found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        position,
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
exports.createPosition = async (req, res) => {
  try {
    const newPosition = await Position.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        position: newPosition,
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
exports.updatePosition = async (req, res) => {
  try {
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!position) {
      return res.status(404).json({
        status: "fail",
        message: "No position found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        position,
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
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    if (!position) {
      return res.status(404).json({
        status: "fail",
        message: "No position found with that ID",
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
