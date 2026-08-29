const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const { OAuth2Client } = require("google-auth-library");
const userModel = require("../models/user.model");
const authOtpModel = require("../models/authOtp.model");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

const normalizeEmail = (value = "") => {
  const email = String(value).trim().toLowerCase();
  return /^\S+@\S+\.\S+$/.test(email) ? email : null;
};

const normalizeIndianPhone = (value = "") => {
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
};

const otpHash = (destination, code) => crypto
  .createHmac("sha256", process.env.OTP_SECRET || process.env.JWT_SECRET)
  .update(`${destination}:${code}`)
  .digest("hex");

const safeEqual = (a, b) => {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email?.endsWith("@phone.hireedge.local") ? null : user.email,
  phone: user.phone || null,
});

const addAuthProvider = (user, provider) => {
  if (!Array.isArray(user.authProviders)) user.authProviders = [];
  if (!user.authProviders.includes(provider)) user.authProviders.push(provider);
};

const finishAuthentication = (res, user, created = false) => {
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.cookie("token", token, cookieOptions);
  return res.status(created ? 201 : 200).json({
    message: created ? "Account created successfully." : "Signed in successfully.",
    created,
    user: publicUser(user),
  });
};

async function uniqueUsername(seed) {
  const base = String(seed || "hireedge-user")
    .toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 28) || "hireedgeuser";
  let candidate = base;
  let suffix = 1;
  while (await userModel.exists({ username: candidate })) candidate = `${base}${suffix++}`;
  return candidate;
}

function getSmtpTransport() {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  if (required.some((key) => !process.env[key]?.trim())) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function getTwilioClient() {
  if (!["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"]
    .every((key) => process.env[key]?.trim())) return null;
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function phoneProviderError(error) {
  const providerMessage = String(error?.message || "");
  if (error?.code === 20003 && /trial account/i.test(providerMessage)) {
    return { status: 503, message: "Phone OTP is unavailable on the Twilio trial plan. Upgrade the Twilio account and try again." };
  }
  if (error?.status === 401 || error?.code === 20003) {
    return { status: 503, message: "Twilio credentials were rejected. Check the Account SID and Auth Token." };
  }
  if (error?.status === 404 || error?.code === 20404) {
    return { status: 503, message: "The Twilio Verify Service SID was not found. Check TWILIO_VERIFY_SERVICE_SID." };
  }
  if (error?.code === 60605) {
    return { status: 503, message: "Twilio is blocking SMS delivery to India. Enable India in Verify Geo Permissions." };
  }
  if (error?.status === 429) {
    return { status: 429, message: "Twilio temporarily rate-limited this number. Please wait before requesting another code." };
  }
  return null;
}

async function requestOtpController(req, res) {
  try {
    const { channel } = req.body;
    if (channel === "email") {
      const email = normalizeEmail(req.body.value);
      if (!email) return res.status(400).json({ message: "Enter a valid email address." });
      const transport = getSmtpTransport();
      if (!transport) return res.status(503).json({ message: "Email verification is not configured yet." });

      const code = String(crypto.randomInt(100000, 1000000));
      await authOtpModel.findOneAndUpdate(
        { channel: "email", destination: email },
        { codeHash: otpHash(email, code), attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        { upsert: true, new: true },
      );
      await transport.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `${code} is your HireEdge verification code`,
        text: `Your HireEdge verification code is ${code}. It expires in 10 minutes. Do not share this code.`,
        html: `<div style="font-family:Arial,sans-serif;background:#090a0f;color:#f7f7fa;padding:32px;border-radius:16px"><h2 style="margin:0 0 12px">Verify your HireEdge sign-in</h2><p style="color:#a0a4ae">Enter this six-digit code to continue:</p><div style="font-size:34px;letter-spacing:10px;font-weight:800;color:#ff2d78;margin:24px 0">${code}</div><p style="color:#777b86;font-size:13px">This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`,
      });
      return res.json({ message: "Verification code sent.", expiresIn: 600 });
    }

    if (channel === "phone") {
      const phone = normalizeIndianPhone(req.body.value);
      if (!phone) return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number." });
      const client = getTwilioClient();
      if (!client) return res.status(503).json({ message: "Phone verification is not configured yet." });
      await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: "sms" });
      return res.json({ message: "Verification code sent.", expiresIn: 600 });
    }

    return res.status(400).json({ message: "Choose email or phone verification." });
  } catch (error) {
    console.error("requestOtpController error:", error.message);
    const providerError = phoneProviderError(error);
    if (providerError) return res.status(providerError.status).json({ message: providerError.message });
    return res.status(502).json({ message: "Could not send the verification code. Please try again." });
  }
}

async function verifyOtpController(req, res) {
  try {
    const { channel } = req.body;
    const code = String(req.body.code || "").trim();
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ message: "Enter the six-digit verification code." });

    if (channel === "email") {
      const email = normalizeEmail(req.body.value);
      if (!email) return res.status(400).json({ message: "Enter a valid email address." });
      const otp = await authOtpModel.findOne({ channel: "email", destination: email });
      if (!otp || otp.expiresAt <= new Date()) return res.status(400).json({ message: "This code has expired. Request a new one." });
      if (otp.attempts >= 5) return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
      if (!safeEqual(otp.codeHash, otpHash(email, code))) {
        otp.attempts += 1;
        await otp.save();
        return res.status(400).json({ message: "Incorrect verification code." });
      }
      await authOtpModel.deleteOne({ _id: otp._id });
      let user = await userModel.findOne({ email });
      const created = !user;
      if (!user) user = await userModel.create({
        username: await uniqueUsername(email.split("@")[0]), email, password: null,
        emailVerified: true, authProviders: ["email"],
      });
      else {
        user.emailVerified = true;
        addAuthProvider(user, "email");
        await user.save();
      }
      return finishAuthentication(res, user, created);
    }

    if (channel === "phone") {
      const phone = normalizeIndianPhone(req.body.value);
      if (!phone) return res.status(400).json({ message: "Enter a valid 10-digit Indian mobile number." });
      const client = getTwilioClient();
      if (!client) return res.status(503).json({ message: "Phone verification is not configured yet." });
      const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });
      if (check.status !== "approved") return res.status(400).json({ message: "Incorrect or expired verification code." });
      let user = await userModel.findOne({ phone });
      const created = !user;
      if (!user) user = await userModel.create({
        username: await uniqueUsername(`user${phone.slice(-4)}`),
        email: `${phone.replace(/\D/g, "")}@phone.hireedge.local`, password: null,
        phone, phoneVerified: true, authProviders: ["phone"],
      });
      else {
        user.phoneVerified = true;
        addAuthProvider(user, "phone");
        await user.save();
      }
      return finishAuthentication(res, user, created);
    }

    return res.status(400).json({ message: "Choose email or phone verification." });
  } catch (error) {
    console.error("verifyOtpController error:", error.message);
    const providerError = phoneProviderError(error);
    if (providerError) return res.status(providerError.status).json({ message: providerError.message });
    return res.status(502).json({ message: "Verification failed. Please try again." });
  }
}

async function googleAuthController(req, res) {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!googleClientId?.endsWith(".apps.googleusercontent.com") || /\s/.test(googleClientId)) {
      return res.status(503).json({ message: "The backend Google Client ID is invalid. Copy VITE_GOOGLE_CLIENT_ID into GOOGLE_CLIENT_ID and restart the backend." });
    }
    const credential = req.body.credential;
    if (!credential) return res.status(400).json({ message: "Google credential is required." });
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: googleClientId });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile.email || !profile.email_verified) return res.status(401).json({ message: "Google could not verify this email address." });
    const email = profile.email.toLowerCase();
    let user = await userModel.findOne({ $or: [{ googleId: profile.sub }, { email }] });
    const created = !user;
    if (!user) user = await userModel.create({
      username: await uniqueUsername(profile.name || email.split("@")[0]),
      email, password: null, googleId: profile.sub, emailVerified: true, authProviders: ["google"],
    });
    else {
      user.googleId = profile.sub;
      user.emailVerified = true;
      addAuthProvider(user, "google");
      await user.save();
    }
    return finishAuthentication(res, user, created);
  } catch (error) {
    console.error("googleAuthController error:", error.message);
    return res.status(401).json({ message: "Google sign-in could not be verified." });
  }
}

module.exports = { requestOtpController, verifyOtpController, googleAuthController };
