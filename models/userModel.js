const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    phone: {
      type: String,
      trim: true,
      match: [/^\d{10,15}$/, "Invalid phone number"],
    },
    altPhone: {
      type: String,
      trim: true,
      match: [/^\d{10,15}$/, "Invalid phone number"],
    },

    dob: { type: Date }, // Store as Date instead of String
    sex: { type: String, trim: true },
    maritalStatus: { type: String, trim: true },
    address: { type: String, trim: true },
    stateOfOrigin: { type: String, trim: true },
    department: { type: String, trim: true },
    position: { type: String, required: true, trim: true },
    employmentYear: { type: Number, min: 1900, max: new Date().getFullYear() },

    disability: { type: Boolean, default: false },
    disabilityType: { type: String, trim: true },

    accountDetails: {
      bankName: { type: String, trim: true },
      accountName: { type: String, trim: true },
      accountNumber: {
        type: String,
        trim: true,
        match: [/^\d{10,15}$/, "Invalid account number"],
      },
    },

    role: { type: String, required: true, trim: true, default: "staff" },
    staffId: { type: String, unique: true, trim: true },

    isApproved: { type: Boolean, default: false },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // Ensures case insensitivity
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    resetPasswordExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },

    password: { type: String, select: false },
    tempPassword: { type: String, select: false },
    tempPasswordExpiry: { type: Date, select: false },

    profileCompleted: { type: Boolean, default: false },
    userProfileImage: { type: String, trim: true },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
