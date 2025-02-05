const UserModel = require("../models/userModel");

const checkApproval = async (req, res, next) => {
  try {
    const { email } = req.body; // Assuming the email is sent in the request body

    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is approved
    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account has not been approved by the admin.",
      });
    }

    // If the user is approved, proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkApproval;
