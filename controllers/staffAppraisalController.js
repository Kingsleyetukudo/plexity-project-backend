const { default: mongoose } = require("mongoose");
const StaffAppraisal = require("../models/staffAppraisalModel");

// Get all staff appraisals
exports.getAllStaffAppraisals = async (req, res) => {
  try {
    const appraisals = await StaffAppraisal.find();
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

exports.getAllAppraisalByCurrentUserId = async (req, res) => {
  const { employeeId } = req.params;

  // Check if the ID is valid
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid employee ID.",
    });
  }

  try {
    const appraisals = await StaffAppraisal.find({
      appraisedEmployee: employeeId,
    });

    if (!appraisals || appraisals.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No appraisal found for that employee ID.",
      });
    }

    res.status(200).json({
      status: "success",
      data: appraisals,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Server error occurred. " + err.message,
    });
  }
};

// Get a single staff appraisal by ID
exports.getStaffAppraisal = async (req, res) => {
  try {
    const appraisal = await StaffAppraisal.findById(req.params.id)
      .populate("appraisedEmployee")
      .populate("appraisedBy");
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

// Create a new staff appraisal
exports.createStaffAppraisal = async (req, res) => {
  const { appraisal, appraisedBy, appraisedEmployee, ...otherAppraisalsData } =
    req.body;

  let totalScore = 0;
  let validRatingCount = 0;
  let totalQuestions = 0;

  if (!Array.isArray(appraisal)) {
    return res.status(400).json({
      status: "fail",
      message: "'appraisal' must be an array.",
    });
  }

  appraisal.forEach((item) => {
    if (item.questions && Array.isArray(item.questions)) {
      totalQuestions += item.questions.length;
      item.questions.forEach((question) => {
        const rating = question.rating;
        if (
          rating &&
          typeof rating === "number" &&
          rating >= 0 &&
          rating <= 5
        ) {
          totalScore += rating;
          validRatingCount++;
        }
      });
    }
  });

  const overallRating =
    totalQuestions > 0
      ? parseFloat((totalScore / totalQuestions).toFixed(2))
      : 0;

  try {
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const existingAppraisal = await StaffAppraisal.findOne({
      appraisedBy: mongoose.Types.ObjectId.createFromHexString(appraisedBy),
      appraisedEmployee:
        mongoose.Types.ObjectId.createFromHexString(appraisedEmployee),
      date: { $gte: firstDayOfMonth },
    });

    if (existingAppraisal) {
      return res.status(400).json({
        status: "fail",
        message: "You have already appraised this user this month.",
      });
    }

    const newAppraisal = await StaffAppraisal.create({
      appraisal,
      appraisedBy,
      appraisedEmployee,
      ...otherAppraisalsData,
      totalScore,
      overallRating,
      validRatingCount,
      totalQuestions,
      date: new Date(),
    });

    res.status(201).json({
      status: "success",
      data: {
        appraisal: newAppraisal,
        validRatingCount,
        totalQuestions,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Update a staff appraisal by ID
exports.updateStaffAppraisal = async (req, res) => {
  try {
    const appraisal = await StaffAppraisal.findByIdAndUpdate(
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

// Delete a staff appraisal by ID
exports.deleteStaffAppraisal = async (req, res) => {
  try {
    const appraisal = await StaffAppraisal.findByIdAndDelete(req.params.id);
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
