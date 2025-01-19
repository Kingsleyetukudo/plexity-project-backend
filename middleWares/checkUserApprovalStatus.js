const UserModel = require("../models/userModel");

const checkApproval = async (req, res, next) => {
  try {
    // Get the user ID from the token (assuming you're using JWT for authentication)
    const { email } = req.body;

    // Find the user in the database
    // const user = await UserModel.findOne({ email });
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

    // If approved, proceed to the next middleware or route
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkApproval;
