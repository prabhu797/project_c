const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter")
const { registerSchema, loginSchema } = require("../validators/auth");

const router = express.Router();

// Register
router.post("/register", authLimiter, validate(registerSchema), async (req, res) => {
    const { username, password, displayName } = req.body;

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: "Username already exists." });

        const hashed = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashed, displayName });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error during registration." });
    }
});

// Login
router.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User not found." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid password." });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during login." });
    }
});

// Get user profile
router.get("/me", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
});

module.exports = router;
