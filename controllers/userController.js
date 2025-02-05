const UserModel = require("../models/userModel");
const Counter = require("../models/counterModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Function to Get Next Staff Number
async function getNextStaffId(position) {
  const counter = await Counter.findOneAndUpdate(
    { _id: position },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } // Create the counter if it doesn't exist
  );
  const idNumber = counter.sequence_value.toString().padStart(3, "0");
  return `${position}${idNumber}`;
}

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });
    res.status(200).json({ users: usersWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing user
exports.updateUser = async (req, res) => {
  try {
    // Find the current user data
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the position is being updated
    if (req.body.position && req.body.position !== user.position) {
      // Generate a new staffId for the updated position
      req.body.staffId = await getNextStaffId(req.body.position.toLowerCase());
    }

    // Update the user
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    const { password: updatedPassword, ...updatedUserWithoutPassword } =
      updatedUser.toObject();

    res.status(200).json({
      message: "User updated successfully",
      updatedUser: updatedUserWithoutPassword,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid data", details: error.errors });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Registration email sending for notification
const sendRegistrationEmail = async (email, firstName, lastName) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // You can use other services like Outlook, Yahoo, etc.
      auth: {
        user: "etukudokingsley07@gmail.com", // Replace with your email
        pass: "cqhdifyjmlducrvv", // Replace with your email password
      },
    });

    // Email options
    const mailOptions = {
      from: "etukudokingsley07@gmail.com", // Sender address
      to: email, // Recipient address
      subject: "Registration Successful",
      html: `
        <h1>Welcome, ${lastName}!</h1>
        <p>Thank you for registering on our platform. Your registration has been successfully completed.</p>
        <p>Please click the link below to log in:</p>
        <a href="http://yourdomain.com/login" target="_blank">Log in to your account</a>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Your Company Name</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

// Create a new user with password hashing and email check
exports.createUser = async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    password,
    position,
    token,
    ...otherDetails
  } = req.body;

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    const { success, score } = response.data;

    if (success && score > 0.5) {
      // Check if the email is already registered
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate Staff ID
      const staffId = await getNextStaffId(position.toLowerCase());

      // Create a new user with hashed password
      const user = new UserModel({
        email,
        password: hashedPassword,
        position,
        staffId,
        firstName,
        lastName,
        token,
        ...otherDetails,
      });
      const newUser = await user.save();

      // Generate JWT token
      const JWTtoken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const { password: userPassword, ...userWithoutPassword } =
        newUser.toObject();

      // Send the registration email
      await sendRegistrationEmail(email, firstName, lastName);

      res.status(201).json({ user: userWithoutPassword, JWTtoken });
    } else {
      res
        .status(400)
        .json({ success: false, message: "reCAPTCHA verification failed." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password, reCaptchatoken } = req.body;

  try {
    // reCAPTCHA verification
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${reCaptchatoken}`
    );

    const { success, score } = response.data;

    if (success && score > 0.5) {
      // Check if the user exists
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email not found!" });
      }

      // Check if the user is approved
      if (!user.isApproved) {
        return res.status(403).json({
          isApproved: user.isApproved,
          message: "Your account is pending approval by the admin.",
        });
      }

      // Compare the password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      const { password: userPassword, ...userWithoutPassword } =
        user.toObject();

      res.status(200).json({
        user: userWithoutPassword,
        token,
        role: user.role,
        isApproved: user.isApproved,
        message: "Login successful",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "reCAPTCHA verification failed." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    // Only allow admin to approve users
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied." });
    // }

    // Update the user's approval status
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: "User approved successfully.",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
