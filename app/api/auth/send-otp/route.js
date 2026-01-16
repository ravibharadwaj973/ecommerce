// app/api/auth/send-otp/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Otp from "../../models/Otp";
import { generate4DigitOtp, hashOtp } from "../../_lib/otp";
import { sendOtpEmail } from "../../_lib/email";
import { requireAuth } from "../../auth/auth"; // middleware helper

export async function POST(request) {
  try {
    await connectDB();

    // ✅ Authenticate user
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user; 
    const email = user.email;

    const otp = generate4DigitOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp:otpHash,
      expiresAt,
      used: false,
   
      
    });

    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
