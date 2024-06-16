const mongoose = require("mongoose");

// Define the user schema
const PinSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    pin:{
        type: String,
        required: true,
        unique: true
    }

});

// Create a User model based on the user schema
const Pin = mongoose.model("Pin", PinSchema);

module.exports = Pin;
