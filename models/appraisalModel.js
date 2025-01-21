const mongoose = require("mongoose");

const appraisalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [{ type: String }],
});

const Appraisal = mongoose.model("Appraisal", appraisalSchema);

module.exports = Appraisal;
