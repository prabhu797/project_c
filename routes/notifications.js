const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const Subscription = require("../models/Subscription");

router.post("/subscribe", authenticate, async (req, res) => {
  const { endpoint, keys } = req.body;

  try {
    await Subscription.findOneAndUpdate(
      { userId: req.user.userId },
      { endpoint, keys },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Subscription saved" });
  } catch (error) {
    console.error("Subscription save error:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

module.exports = router;
