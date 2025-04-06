const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authenticate = require("../middleware/auth"); // your JWT middleware

// Get chat history between logged-in user and another user
router.get("/:userId", authenticate, async (req, res) => {
  const currentUserId = req.user.userId;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: -1 }); // ascending

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
