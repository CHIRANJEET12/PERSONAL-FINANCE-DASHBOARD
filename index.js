import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const jwtpassword = "12345";
import bodyParser from "body-parser";
// user.js
export const User = {...}; // Your User model definition here


// main file
import { User } from './models/user.js';




const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('Public'));
app.use(bodyParser.urlencoded({extended:true}));


// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Database
mongoose.connect("mongodb://localhost:27017/bank")
.then(()=>{
  console.log("connected");
})

// Routes
app.use("", User);

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
