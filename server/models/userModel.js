const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, require: true, minlength: 3, maxlength: 30 },
    email: {
      type: String,
      require: true,
      minlength: 3,
      maxlength: 200,
      unique: true,
    },
    password: { type: String, require: true, minlength: 3, maxlength: 1024 },
  },
  { timestamps: true }
);

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.virtual("userNotifications", {
  ref: "UserNotification",
  localField: "_id",
  foreignField: "user",
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
