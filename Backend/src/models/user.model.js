const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "username already taken"],
    required: true,
  },

  email: {
    type: String,
    unique: [true, "Account already exists with this email address"],
    required: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    default: null,
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  authProviders: {
    type: [String],
    enum: ["password", "email", "phone", "google"],
    default: ["password"],
  },
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
