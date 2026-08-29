const mongoose = require("mongoose");

const authOtpSchema = new mongoose.Schema({
  channel: { type: String, enum: ["email"], required: true },
  destination: { type: String, required: true, lowercase: true, trim: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

authOtpSchema.index({ channel: 1, destination: 1 }, { unique: true });

module.exports = mongoose.model("auth_otps", authOtpSchema);
