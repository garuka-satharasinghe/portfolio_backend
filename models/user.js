const mongoose = require("../db");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
