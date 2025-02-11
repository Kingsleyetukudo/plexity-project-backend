const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },
    Altphone: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    sex: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    stateOfOrigin: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    employmentYear: {
      type: String,
    },
    disability: {
      type: Boolean,
    },
    disabilityType: {
      type: String,
      trim: true,
    },
    accountDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      accountName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
    },
    role: {
      type: String,
      required: true,
      trim: true,
      default: "staff",
    },
    staffId: {
      type: String,
      unique: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      // required: true,
    },
    profileCompleted: { type: Boolean, default: false },
    tempPassword: String, // Store temp password
    tempPasswordExpiry: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
