const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// 🔹 Allow CORS for your frontend domains
app.use(
  cors({
    origin: [
      "https://appraisalapp.netlify.app", // Netlify frontend
      "http://localhost:5000", // Localhost for development
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies if needed
  })
);

app.use(bodyParser.json());

// 🔹 Database connection (Replace with MongoDB Atlas URI)
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout if no connection in 5s
    socketTimeoutMS: 45000, // Close inactive sockets
    maxPoolSize: 10,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 🔹 Import routes
const user = require("./routes/userRoute");
const appraisal = require("./routes/appraisalRoute");
const appraised = require("./routes/staffAppraisalRoute");
const comment = require("./routes/commentRoute");

app.use("/user", user);
app.use("/appraisal", appraisal);
app.use("/appraised", appraised);
app.use("/comment", comment);

// 🔹 Test Route
app.get("/test", (req, res) => {
  res.send("Hello World! Server is running.");
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
