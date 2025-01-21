const Appraisal = require("../models/appraisalModel");

// Get all appraisals
exports.getAllAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find();
    res.status(200).json({
      status: "success",
      results: appraisals.length,
      data: {
        appraisals,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Get a single appraisal by ID
exports.getAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id);
    if (!appraisal) {
      return res.status(404).json({
        status: "fail",
        message: "No appraisal found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        appraisal,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Create a new appraisal
exports.createAppraisal = async (req, res) => {
  try {
    const newAppraisal = await Appraisal.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        appraisal: newAppraisal,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update an existing appraisal
exports.updateAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!appraisal) {
      return res.status(404).json({
        status: "fail",
        message: "No appraisal found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        appraisal,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Delete an appraisal
exports.deleteAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByIdAndDelete(req.params.id);
    if (!appraisal) {
      return res.status(404).json({
        status: "fail",
        message: "No appraisal found with that ID",
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
