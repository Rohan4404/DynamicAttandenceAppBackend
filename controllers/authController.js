const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/Organization");
const sendMail = require("../utils/sendMail");

const OTP_VALID_DURATION = 10 * 60 * 1000; // 10 minutes

exports.signUp = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    contact_person_name,
    contact_person_number,
  } = req.body;

  try {
    const existingEmail = await Organization.findOne({ where: { email } });
    const existingName = await Organization.findOne({ where: { name } });

    if (existingEmail)
      return res.status(400).json({ message: "Email already exists" });
    if (existingName)
      return res
        .status(400)
        .json({ message: "Organization name already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const org_code = name.substring(0, 3).toUpperCase();

    const org = await Organization.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      contact_person_name,
      contact_person_number,
      otp,
      otp_generated_at: new Date(), // ✅ set generation time
      org_code,
    });

    await sendMail(
      email,
      "OTP Verification - HR Management System",
      `Hello ${name},\n\nYour OTP for verifying your organization is: ${otp}\n\nThank you.`
    );

    res.status(201).json({ message: "Registered. OTP sent to email." });
  } catch (error) {
    console.error("❌ Sign-up error:", error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Server error during registration." });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const org = await Organization.findOne({ where: { email } });

    if (!org || org.otp !== otp) {
      return res.status(400).json({
        code: "INVALID_OTP",
        message: "Invalid OTP",
      });
    }

    const timeSinceOtp = new Date() - new Date(org.otp_generated_at);
    if (timeSinceOtp > OTP_VALID_DURATION) {
      return res.status(400).json({
        code: "OTP_EXPIRED",
        message: "OTP expired. Please request a new one.",
      });
    }

    org.is_verified = true;
    org.otp = null;
    org.otp_generated_at = null;
    await org.save();

    res.status(200).json({ message: "Organization verified." });
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Failed to verify OTP." });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const org = await Organization.findOne({ where: { email } });

    if (!org || !org.is_verified)
      return res
        .status(401)
        .json({ message: "Not authorized or not verified" });

    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: org.id, role: "org-admin" },
      process.env.JWT_SECRET
    );

    res.json({
      message: "Sign-in successful",
      token,
      organization: {
        id: org.id,
        name: org.name,
        email: org.email,
        phone: org.phone,
        address: org.address,
        org_code: org.org_code,
        contact_person_name: org.contact_person_name,
        contact_person_number: org.contact_person_number,
      },
    });
  } catch (err) {
    console.error("❌ Sign-in error:", err);
    res.status(500).json({ message: "Server error during sign-in." });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const org = await Organization.findOne({ where: { email } });

    if (!org)
      return res.status(404).json({
        code: "ORG_NOT_FOUND",
        message: "Organization not found",
      });

    if (org.is_verified)
      return res.status(400).json({
        code: "ALREADY_VERIFIED",
        message: "Organization already verified",
      });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    org.otp = newOtp;
    org.otp_generated_at = new Date();
    await org.save();

    await sendMail(
      email,
      "Resent OTP - HR Management System",
      `Hello ${org.name},\n\nYour new OTP for verifying your organization is: ${newOtp}\n\nThank you.`
    );

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (err) {
    console.error("❌ OTP resend error:", err);
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Failed to resend OTP." });
  }
};

// 📌 Forgot Password - Sends OTP to email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const org = await Organization.findOne({ where: { email } });
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    org.otp = otp;
    org.otp_generated_at = new Date();
    await org.save();

    await sendMail(
      email,
      "Reset Password - HR Management System",
      `Hello ${org.name},\n\nYour OTP for resetting your password is: ${otp}\n\nIf you didn’t request this, please ignore.`
    );

    res.json({ message: "OTP sent to email for password reset." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset OTP." });
  }
};

// 📌 Reset Password - Verify OTP and update password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const org = await Organization.findOne({ where: { email } });
    if (!org || org.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP or email." });

    const timeSinceOtp = new Date() - new Date(org.otp_generated_at);
    if (timeSinceOtp > OTP_VALID_DURATION) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    org.password = await bcrypt.hash(newPassword, 10);
    org.otp = null;
    org.otp_generated_at = null;
    await org.save();

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password." });
  }
};
