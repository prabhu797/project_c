const webpush = require("./webPush");
const Subscription = require("../models/Subscription");

const sendPushNotification = async (userId, title, body) => {
  try {
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) return;

    const payload = JSON.stringify({ title, body });

    await webpush.sendNotification(subscription, payload);
  } catch (err) {
    console.error("❌ Error sending push notification:", err);
  }
};

module.exports = sendPushNotification;
