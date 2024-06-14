const express = require("express")
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtpassword = "12345"
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user")

router.get("/", (req, res) => {
    res.render("home", { title: 'homepage' })
})

router.get("/login", (req, res) => {
    res.render("login")
})
router.get("/signup", (req, res) => {
    res.render("signup")
})

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const uniqueId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ userId: uniqueId, name, email, password: hashedPassword });
        console.log(uniqueId)
        await newUser.save();
        res.redirect("/login");
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error signing up. Please try again later.");
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user.userId, email: user.email }, jwtpassword);
            // res.json({ token });
            // res.send("Login successful");
            res.redirect("/")
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in. Please try again later.");
    }

})

module.exports = router;