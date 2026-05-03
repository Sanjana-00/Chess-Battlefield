const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.send("Registration Failed");
    }
});

router.get("/Login", (req, res) => {
    res.send("login");
});

router.post("/Login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Wrong Password");
        }

        req.session.user = user;

        res.json({
    message: "Login successful",
    user: {
        id: user._id,
        username: user.username,
        email: user.email
    }
    });
    } catch (err) {
        console.log(err);
        res.send("Login Failed");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;