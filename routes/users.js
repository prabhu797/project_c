const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

// GET /api/users?search=abc
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const users = await User.find({
      _id: { $ne: req.user.userId }, // exclude current user
      username: regex
    }).select("username"); // expose only needed fields

    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
