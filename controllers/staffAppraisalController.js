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
  const { appraisal, ...otherAppraisalsData } = req.body;

  let totalScore = 0;
  let validRatingCount = 0;
  let totalQuestions = 0;

  // Check if appraisal is an array
  if (appraisal && Array.isArray(appraisal)) {
    appraisal.forEach((item) => {
      // Check if the item has 'questions' and it's an array
      if (item.questions && Array.isArray(item.questions)) {
        totalQuestions += item.questions.length; // Count the questions in this appraisal
        item.questions.forEach((question) => {
          const rating = question.rating;

          // If rating is a valid number between 0 and 5, we process it
          if (
            rating &&
            typeof rating === "number" &&
            rating >= 0 &&
            rating <= 5
          ) {
            totalScore += rating;
            validRatingCount++; // Increment the valid rating count
            roundedOverallRating = totalScore / totalQuestions;
            overallRating = parseFloat(roundedOverallRating.toFixed(2));
          } else if (rating && typeof rating === "string") {
            // If rating is a string, check its length
            if (rating.length > 0) {
              console.log(
                `Rating is a non-empty string with length: ${rating.length}`
              );
            } else {
              console.warn("Empty rating string encountered.");
            }
          } else {
            console.warn("Invalid rating value encountered:", rating);
          }
        });
      }
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message:
        "'appraisal' must be an array of items with valid 'questions' and 'rating' values.",
    });
  }

  try {
    const newAppraisal = await StaffAppraisal.create({
      appraisal,
      ...otherAppraisalsData,
      totalScore,
      overallRating,
      validRatingCount,
      totalQuestions,
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
    res.status(400).json({
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
