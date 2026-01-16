import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config/db";
import User from "../../models/users";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("reset_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized or expired session" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();
    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: "New password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clear reset cookie
    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
    response.cookies.delete("reset_token");

    return response;
  } catch (error) {
    console.error("change-password error:", error);
    return NextResponse.json(
      { success: false, message: "Error changing password", error: error.message },
      { status: 500 }
    );
  }
}
