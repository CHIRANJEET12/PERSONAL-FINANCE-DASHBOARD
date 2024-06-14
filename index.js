const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const jwtpassword = "12345";
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Database
mongoose.connect("mongodb://localhost:27017/bank")
.then(()=>{
  console.log("connected");
})

// Routes
app.use("", require("./routes/user"));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
