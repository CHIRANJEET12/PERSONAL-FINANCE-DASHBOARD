const mongoose = require("mongoose");

// Define the pin schema
const PinSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true 
    },
    pin: {
        type: String,
        required: true 
    }
});

// Create a Pin model based on the pin schema
const Pin = mongoose.model("Pin", PinSchema);

module.exports = Pin;
