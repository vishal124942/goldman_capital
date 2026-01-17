import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Otp } from "../models/mongodb.js";
import { Request, Response, NextFunction } from "express";
import { sendOtpEmail } from "./mail";

const envJwtSecret = process.env.JWT_SECRET;
if (!envJwtSecret) {
  throw new Error("JWT_SECRET must be set in .env file");
}
const JWT_SECRET: string = envJwtSecret;
const OTP_EXPIRY_MINUTES = 10;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: any) {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function generateAndSendOtp(userId: string, emailOrPhone: string, type: "email" | "phone" = "email") {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

  // Mark previous OTPs as used
  await Otp.updateMany(
    { userId, isUsed: false },
    { $set: { isUsed: true } }
  );

  // Create new OTP
  await Otp.create({
    userId,
    code,
    type,
    expiresAt,
    isUsed: false,
  });

  if (type === "email") {
    await sendOtpEmail(emailOrPhone, code);
  } else {
    // For phone, we just log it for now
    console.log(`[PHONE OTP] To: ${emailOrPhone}, Code: ${code}`);
  }

  return code;
}

export async function verifyOtp(userId: string, code: string) {
  const otp = await Otp.findOne({
    userId,
    code,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (otp) {
    await Otp.updateOne({ _id: otp._id }, { $set: { isUsed: true } });
    return true;
  }
  return false;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid session" });
      }
      (req as any).user = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};
