import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Otp from "../../models/Otp";
import { compareOtp } from "../../_lib/otp";
import jwt from "jsonwebtoken";
import {requireAuth} from "../auth"

export async function POST(request) {
  try {
    await connectDB();
    const user=await requireAuth(request);
    const email=user.email;


    const { otp } = await request.json();
    if ( !otp) {
      return NextResponse.json(
        { success: false, message: " OTP required" },
        { status: 400 }
      );
    }
console.log(email)
    // Find latest OTP for this email that’s unused
    const otpDoc = await Otp.findOne({ email, used: false }).sort({ createdAt: -1 });
    if (!otpDoc) {
      return NextResponse.json(
        { success: false, message: "No OTP request found" },
        { status: 404 }
      );
    }

    // Check expiry
    if (otpDoc.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 410 }
      );
    }

    // Check attempts
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      return NextResponse.json(
        { success: false, message: "Too many invalid attempts" },
        { status: 429 }
      );
    }

    // Validate OTP
    const isMatch = await compareOtp(otp, otpDoc.otp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    // Create short-lived JWT (5 minutes)
    const resetToken = jwt.sign(
      { email }, 
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "5m" } // expires in 5 minutes
    );

    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });

    // Set short-lived cookie
    response.cookies.set("reset_token", resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 5 * 60, // 5 minutes
    });

    return response;
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
