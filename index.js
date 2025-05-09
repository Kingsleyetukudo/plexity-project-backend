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
      "http://localhost:5173",
      "https://appraisalapp.netlify.app",
      "https://appraisal.plexitydigital.ng",
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
    serverSelectionTimeoutMS: 5000, // Timeout if no connection in 5s
    socketTimeoutMS: 45000, // Timeout for socket inactivity
    maxPoolSize: 10,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 🔹 Import routes
const user = require("./routes/userRoute");
const appraisal = require("./routes/appraisalRoute");
const appraised = require("./routes/staffAppraisalRoute");
const comment = require("./routes/commentRoute");
const department = require("./routes/departmentRoute");
const position = require("./routes/positionRoute");

app.use("/user", user);
app.use("/appraisal", appraisal);
app.use("/appraised", appraised);
app.use("/comment", comment);
app.use("/department", department);
app.use("/position", position);

// 🔹 Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
