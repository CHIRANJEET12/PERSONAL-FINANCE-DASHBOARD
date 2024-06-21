const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user");
const Pin = require("../models/pin");
const Exp = require("../models/expence");
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

router.get("/expence", async (req, res) => {
    try {
        const expenses = await Exp.find({});
        res.render("expence", { expenses });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data");
    }
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

router.get("/balance", (req, res) => {
    res.render("balance");
});

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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const newPin = new Pin({ email, pin });
        await newPin.save();

        res.render("balance");
    } catch (error) {
        console.error("Error in pin-validation:", error);
        res.status(500).send("Error in pin-validation. Please try again later.");
    }
});

router.post("/entre", authenticateToken, async (req, res) => {
    const { pin } = req.body;
    try {
        const pinvalid = await Pin.findOne({ pin });

        if (!pinvalid) {
            return res.status(404).send("Incorrect Pin");
        } else {
            console.log("Valid");
            res.redirect("/dashboard");
        }
    } catch (error) {
        console.error("Error in pin-validation:", error);
        return res.status(500).send("Error in pin-validation. Please try again later.");
    }
});

router.post("/exp", async (req, res) => {
    const { money, desc } = req.body;
    const newExp = new Exp({ money, desc });
    try {
        await newExp.save();
        res.redirect('/expence');
    } catch (err) {
        res.status(400).send("Unable to save to database");
    }
});

module.exports = router;
