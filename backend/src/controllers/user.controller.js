import { User } from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import crypto from "node:crypto";
import sendMail from "../services/sendMail.js";
import { Op } from "sequelize";
import Otp from "../models/otp.model.js";
import wrapAsync from "../utils/wrapAsync.js";
const isProd = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  let user = await User.findOne({ where: { email } });

  if (user) {
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "User already exists. Please sign in." });
    }
    user.username = username;
    user.password = password;
    await user.save();
  } else {
    user = await User.create({
      username,
      email,
      password,
      isVerified: false,
      avatar_url: "",
    });
  }

  const otpRecord = await Otp.generateOTP(user.email);

  const subject = "Verify your Zoom account 🔐";

  const message = `
Hello ${user.username},

Thank you for joining Zoom! To complete your registration and verify your email address, please use the following One-Time Password (OTP):

Verification Code: ${otpRecord.code}

This code is valid for 5 minutes. For security reasons, please do not share this code with anyone.

If you did not request this code, you can safely ignore this email.

Welcome aboard,
The Zentro Team
`;

  await sendMail(user.email, subject, message);

  res.status(201).json({
    message:
      "Registration successful! Please enter the 6-digit code sent to your email to verify your account.",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: { email: email },
    attributes: [
      "user_id",
      "username",
      "email",
      "password",
      "isVerified",
      "avatar_url",
      "token",
    ],
  });

  if (!user || !user.password) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  if (!user.isVerified) {
    return res
      .status(403) // 403
      .json({ message: "Please verify your email before logging in." });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user);

  user.token = token;
  user.token_updated_at = new Date();
  await user.save();

  res.cookie("userToken", user.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

export const logout = async (req, res) => {
  const { user_id } = req.user;

  const user = await User.findByPk(user_id);

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  user.token = null;
  user.token_updated_at = null;
  await user.save();

  res
    .clearCookie("userToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ message: "Logout successful" });
};

export const forgot = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res
      .status(404)
      .json({ message: "User with this email does not exist" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expireDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = expireDate;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const subject = "Password Reset Request";
  const text = `Click the following link to reset your password: ${resetLink}`;

  await sendMail(user.email, subject, text);
  res.status(200).json({ message: "Password reset email sent" });
};

export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    where: {
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Token is invalid or has expired" });
  }
  user.password = password;
  user.resetPasswordToken = null;
  await user.save();
  res.status(200).json({ message: "Password reset successfully" });
};

export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  const newUser = await User.findOne({ where: { email } });
  if (!newUser) {
    return res.status(400).json({ message: "User don't exist" });
  }

  const otpRecord = await Otp.findOne({
    where: { email: email, expiresAt: { [Op.gt]: new Date() } },
    order: [["createdAt", "DESC"]],
  });

  if (!otpRecord || otpRecord.code !== code) {
    return res.status(404).json({ message: "Invalid or expired code" });
  }

  await otpRecord.destroy();

  newUser.isVerified = true;

  const token = generateToken(newUser);

  newUser.token = token;
  newUser.token_updated_at = new Date();
  await newUser.save();

  const message = `Welcome to Zoom, ${newUser.username}! 🎉

We’re excited to have you join our community.
Get started by exploring our features and connecting with others.

Happy Zooming!
`;

  await sendMail(newUser.email, "Welcome to Zentro! 🎉", message);

  res
    .cookie("userToken", newUser.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    })
    .status(200)
    .json({ message: "User registered successfully", user: newUser });
};

export const clearUserTokens = wrapAsync(async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const [affectedCount] = await User.update(
    { token: null, token_updated_at: null },
    {
      where: {
        token_updated_at: { [Op.lt]: thirtyMinutesAgo },
      },
    },
  );

  console.log(`Cleared tokens for ${affectedCount} users.`);
});
