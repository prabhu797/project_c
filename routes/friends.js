const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Friendship = require("../models/Friendship");
const User = require("../models/User");

// Send friend request
router.post("/request", verifyToken, async (req, res, next) => {
  try {
    const recipientId = req.body.userId;

    const existing = await Friendship.findOne({
      requester: req.user.userId,
      recipient: recipientId,
    });

    if (existing)
      return res.status(400).json({ message: "Request already exists" });

    const request = await Friendship.create({
      requester: req.user.userId,
      recipient: recipientId,
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// Accept friend request
router.post("/accept", verifyToken, async (req, res, next) => {
  try {
    const requesterId = req.body.userId;

    const friendship = await Friendship.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: req.user.userId,
        status: "pending",
      },
      { status: "accepted" },
      { new: true }
    );

    if (!friendship) return res.status(404).json({ message: "Request not found" });

    res.json(friendship);
  } catch (err) {
    next(err);
  }
});

// Reject friend request
router.post("/reject", verifyToken, async (req, res, next) => {
  try {
    const requesterId = req.body.userId;

    const friendship = await Friendship.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: req.user.userId,
        status: "pending",
      },
      { status: "rejected" },
      { new: true }
    );

    if (!friendship) return res.status(404).json({ message: "Request not found" });

    res.json(friendship);
  } catch (err) {
    next(err);
  }
});

// Get friends list (accepted only)
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user.userId, status: "accepted" },
        { recipient: req.user.userId, status: "accepted" },
      ],
    }).populate("requester recipient", "username displayName");

    const friends = friendships.map((f) => {
      const friend =
        f.requester._id.toString() === req.user.userId
          ? f.recipient
          : f.requester;
      return friend;
    });

    res.json(friends);
  } catch (err) {
    next(err);
  }
});

// Get pending requests (incoming only)
router.get("/requests", verifyToken, async (req, res, next) => {
  try {
    const requests = await Friendship.find({
      recipient: req.user.userId,
      status: "pending",
    }).populate("requester", "username displayName");

    res.json(requests.map((r) => ({ id: r._id, from: r.requester })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
