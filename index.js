const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const jwtpassword = "12345";
const path = require("path")
const bodyParser = require("body-parser");

const app = express();
const port = 3222;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
