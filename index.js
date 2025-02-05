const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// all route importation here

const user = require("./routes/userRoute");
const appraisal = require("./routes/appraisalRoute");
const appraised = require("./routes/staffAppraisalRoute");
const comment = require("./routes/commentRoute");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
dotenv.config();
app.use(cors());

app.use("/user", user);
app.use("/appraisal", appraisal);
app.use("/appraised", appraised);
app.use("/comment", comment);
// app.use(express.json());

// Database connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
