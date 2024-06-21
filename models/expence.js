const mongoose = require("mongoose");

// Define the user schema
const expSchema = new mongoose.Schema({
    money:{
        type: String,
        required: true,
    },
    desc:{
        type: String,
        required: true,
    }

},{timestamps:true});

// Create a User model based on the user schema
const Exp = mongoose.model("Exp", expSchema);

module.exports = Exp;
