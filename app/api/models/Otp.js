import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const otpSchema = new mongoose.Schema(
  {
   
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    otp: {
      type: String,
      required: [true, "OTP code is required"],
    },
    type: {
      type: String,
      enum: ["password_reset", "email_verification"],
      default: "password_reset",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration time is required"],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Optional index for automatic cleanup after expiry (like TTL in SQL)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent model overwrite errors during Next.js hot reload
const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default Otp;

