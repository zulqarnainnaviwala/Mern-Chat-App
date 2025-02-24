const mongoose = require("mongoose");

const notificationSchema = new Schema({
  title: { type: String, required: true },
  context: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
});

notificationSchema.set("toObject", { virtuals: true });
notificationSchema.set("toJSON", { virtuals: true });

notificationSchema.virtual("userNotifications", {
  ref: "UserNotification",
  localField: "_id",
  foreignField: "notification",
});

const NotificationModel = mongoose.model("Notification", notificationSchema);
module.exports = NotificationModel;
