const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// 🔹 Allow CORS for your frontend domain
app.use(
  cors({
    origin: "https://appraisalapp.netlify.app", // Replace with your frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(bodyParser.json());

// 🔹 Database connection (Replace with MongoDB Atlas)
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
