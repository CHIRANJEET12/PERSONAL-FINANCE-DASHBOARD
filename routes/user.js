const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user");
const Pin = require("../models/pin");
// const Exp = require("../models/expence");
const multer = require("multer");
const path = require('path');
const fs = require("fs");

const jwtpassword = "12345";

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/login");
    }

    jwt.verify(token, jwtpassword, (err, user) => {
        if (err) {
            return res.redirect("/login");
        }
        req.user = user;
        next();
    });
}

router.get("/", (req, res) => {
    res.render("home");
});



router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/pin", authenticateToken, (req, res) => {
    res.render("pin");
});

router.get("/enter_pin", (req, res) => {
    res.render("enter_pin");
});

router.get("/balance", (req, res) => {
    res.render("balance");
});

router.get("/prime",(req,res)=>{
    res.render("prime")
})

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("dashboard", {
            cardnumber: user.cardnumber,
            name: user.name,
            balance: user.balance
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send("Error fetching user details. Please try again later.");
    }
});

router.post("/signup", async (req, res) => {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            cardNumber += ' ';
        }
        cardNumber += Math.floor(Math.random() * 10);
    }
    console.log(cardNumber);
    const randomBalance = Math.floor(Math.random() * 100000);
    const { name, email, password } = req.body;

    try {
        const uniqueId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ userId: uniqueId, name, email, password: hashedPassword, cardnumber: cardNumber, balance: randomBalance });
        await newUser.save();
        console.log(randomBalance);
        res.redirect("/login");
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error signing up. Please try again later.");
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user.userId, email: user.email }, jwtpassword, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.redirect("/pin");
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in. Please try again later.");
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

router.post("/balance", authenticateToken, async (req, res) => {
    const { balance } = req.body;
    const userId = req.user.userId;

    try {
        await User.updateOne(
            { userId: userId },
            { $set: { balance: balance } }
        );
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error in balancing:", error);
        res.status(500).send("Error in balancing");
    }
});
router.post("/pin", authenticateToken, async (req, res) => {
    const { email, pin1, pin2, pin3, pin4, pin5, pin6 } = req.body;
    const pin = `${pin1}${pin2}${pin3}${pin4}${pin5}${pin6}`;

    try {
        const existingPin = await Pin.findOne({ pin });

        if (existingPin) {
            // Generate and suggest an alternative PIN
            const suggestedPin = generateRandomPin(); // Implement your own logic to generate a new PIN
            return res.status(400).send(`This PIN is already in use. Please choose another. You may try PIN: ${suggestedPin} `);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const newPin = new Pin({ email, pin });
        await newPin.save();

        res.render("balance");
    } catch (error) {
        console.error("Error in saving PIN:", error);
        res.status(500).send("Error in saving PIN. Please try again later.");
    }
});

// Function to generate a random PIN for suggestion (example implementation)
function generateRandomPin() {
    let randomPin = "";
    for (let i = 0; i < 6; i++) {
        randomPin += Math.floor(Math.random() * 10);
    }
    return randomPin;
}




router.post("/entre",authenticateToken, async (req, res) => {
    const { pin } = req.body;
    
    try {
        // Find the PIN in the database
        const pinRecord = await Pin.findOne({ pin });

        if (!pinRecord) {
            return res.status(404).send("Incorrect PIN");
        }

        // Redirect to dashboard upon successful PIN validation
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error in PIN validation:", error);
        return res.status(500).send("Error in PIN validation. Please try again later.");
    }
});





module.exports = router;
