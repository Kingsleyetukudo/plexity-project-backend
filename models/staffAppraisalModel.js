const mongoose = require("mongoose");

const staffAppraisalSchema = new mongoose.Schema({
  appraisedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appraisal: [
    {
      title: String,
      questions: [
        {
          question: String,
          rating: {
            type: Number,
            min: 0,
            max: 5,
            required: true,
          },
        },
      ],
    },
  ],
  appraisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
  },
  improveComment: {
    type: String,
  },
  totalScore: Number,
  overallRating: Number,
  percentage: Number,
  date: { type: Date, default: Date.now },
});

const StaffAppraisal = mongoose.model("StaffAppraisal", staffAppraisalSchema);

module.exports = StaffAppraisal;
