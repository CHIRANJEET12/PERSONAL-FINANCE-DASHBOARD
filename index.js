const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config();


const jwtpassword = "12345";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Database
const mongoUri = "mongodb+srv://23052878:uMkS8tfUrtCIeUPW@bank.oxyupmx.mongodb.net/?retryWrites=true&w=majority&appName=bank";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("connected to MongoDB Atlas");
})
.catch(err => {
  console.error("Failed to connect to MongoDB Atlas", err);
});

// Routes
app.use("", require("./routes/user"));
app.use(express.static(path.join(__dirname, 'Public')));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
