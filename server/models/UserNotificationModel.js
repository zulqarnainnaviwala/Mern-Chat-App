const mongoose = require("mongoose");

const userNotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  notification: {
    type: Schema.Types.ObjectId,
    ref: "Notification",
  },
  readAt: { type: Date, required: true, default: Date.now() },
});

const UserNotificationModel = mongoose.model(
  "UserNotification",
  userNotificationSchema
);

module.exports = UserNotificationModel;
