const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // limit each IP to 10 requests per minute
    message: "Too many requests. Please try again later.",
});

module.exports = {
    authLimiter,
};
