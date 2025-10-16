const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: null },
    about: { type: String, default: "Hey there! I'm using PingPulse" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);