const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one subscription per user
  },
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
