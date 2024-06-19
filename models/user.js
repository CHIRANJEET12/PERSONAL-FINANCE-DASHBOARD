const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true // Assuming userId should be unique
    },
    name: {
        type: String,
        required: true,
        trim: true // Automatically remove whitespace from name
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Convert email to lowercase before saving
        trim: true, // Automatically remove whitespace from email
        match: [/\S+@\S+\.\S+/, 'is invalid'] // Email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    cardnumber: {
        type: String,
        required: true,
        unique: true 
    },
    balance: {
        type: String,
        required: true,
        default: '0' // Default balance is 0
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Create a User model based on the user schema
const User = mongoose.model("User", userSchema);

module.exports = User;
