const UserModel = require("../models/userModel");
const Counter = require("../models/counterModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

// Function to Get Next Staff Number
async function getNextStaffId(position) {
  const counter = await Counter.findOneAndUpdate(
    { _id: position },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return `${position}${counter.sequence_value.toString().padStart(3, "0")}`;
}

// Centralized Email Sending Function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "login",
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Plexity Digital Services" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
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
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    if (data.success && data.score > 0.5) {
      if (await UserModel.findOne({ email })) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      // const hashedPassword = await bcrypt.hash(password, 10);
      const staffId = await getNextStaffId(position.toLowerCase());
      const newUser = await new UserModel({
        email,
        position,
        staffId,
        firstName,
        lastName,
        token,
        ...otherDetails,
      }).save();
      const JWTtoken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      await sendEmail(
        email,
        "🎉 Welcome to Plexity Digital Services – Registration Successful!",
        `
        <h1>Welcome to Plexity Digital Services, ${lastName}!</h1>

<p>We’re excited to have you on board. Your registration was successful, an email will be send to you once your account is approved and ready for your use.</p>

<p>To get started, click the button below to log in:</p>

<p>
  <a href="https://appraisal.plexitydigital.ng/login" 
     style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
     Log in to Your Account
  </a>
</p>

<p>If you didn’t sign up for this account, please ignore this email.</p>

<p>Best regards,</p>  
<p><strong>Plexity Digital Services Team</strong></p>
      `
      );

      res.status(201).json({ user: newUser, JWTtoken });
    } else {
      res.status(400).json({ message: "reCAPTCHA verification failed." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Approve User and Send Temporary Password
exports.approveUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash the password before storing it
    user.password = await bcrypt.hash(tempPassword, 10);
    user.isApproved = true;

    // Store the temp password and set expiration (24 hours)
    user.tempPassword = tempPassword;
    user.tempPasswordExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await user.save();

    // Send email with the temporary password
    await sendEmail(
      user.email,
      "🎉 Your Account Has Been Approved – Log in Now!",
      `
      <p>Dear ${user.firstName},</p>

<p>Congratulations! Your account has been successfully approved. You can now log in using the details below:</p>

<ul>
  <li><strong>Email:</strong> ${user.email}</li>
  <li><strong>Temporary Password:</strong> ${tempPassword}</li>
</ul>

<p>
  <a href="https://appraisal.plexitydigital.ng/login" 
     style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
     Log in to Your Account
  </a>
</p>

<p>For security reasons, please change your password immediately after logging in.</p>

<p>If you did not request this account, please ignore this email or contact our support team.</p>

<p>Best regards,</p>  
<p><strong>Plexity Digital Services Team</strong></p>  
    `
    );

    res.status(200).json({
      message: "User approved successfully. Temporary password sent!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Check if the password is being updated
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
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

// Login user
exports.loginUser = async (req, res) => {
  const { email, password, reCaptchatoken } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (!reCaptchatoken) {
      return res.status(400).json({ message: "reCAPTCHA token is required." });
    }

    // reCAPTCHA verification
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({ secret: secretKey, response: reCaptchatoken })
    );

    const { success, score } = response.data;
    if (!(success && score > 0.5)) {
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification failed." });
    }

    // Find user, ensuring password is selected
    // Find user, ensure password and tempPassword are selected
    const user = await UserModel.findOne({ email }).select(
      "+password +tempPassword +tempPasswordExpiry"
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        isApproved: user.isApproved,
        message: "Your account is pending approval by the admin.",
      });
    }

    // Check if tempPassword is valid (not expired)
    let isMatch = false;
    const now = new Date();

    if (user.tempPassword && user.tempPasswordExpiry > now) {
      isMatch = password === user.tempPassword;
    } else {
      // Fallback to normal hashed password
      isMatch = await bcrypt.compare(password, user.password);

      // Optional cleanup: remove expired temp password
      if (user.tempPassword || user.tempPasswordExpiry) {
        user.tempPassword = undefined;
        user.tempPasswordExpiry = undefined;
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Remove sensitive fields from response
    const {
      password: userPassword,
      tempPassword,
      tempPasswordExpiry,
      ...userWithoutPassword
    } = user.toObject();

    res.status(200).json({
      user: userWithoutPassword,
      token,
      role: user.role,
      isApproved: user.isApproved,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let resetToken; // <-- Move this outside so it's accessible later

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const resetPasswordUrl = `${process.env.FRONTEND_URL_PROD}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you requested to reset your password. Please click on the following link to reset your password: \n\n${resetPasswordUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail(email, "Password Reset Request", message);
    res.status(200).json({
      success: true,
      data: "Email sent successfully",
    });
  } catch (error) {
    // Cleanup
    const user = await UserModel.findOne({ email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
