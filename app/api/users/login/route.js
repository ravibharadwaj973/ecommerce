import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config/db";
import User from "../../models/users";
import redis from "../../_lib/redis";
export async function POST(request) {
  try {
    await connectDB();
const ip = request.ip || '127.0.0.1';
    console.log(ip);
    const key = `login_limit:${ip}`;
    // 1. Check Rate Limit
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 120);

    if (count > 5) {
      return NextResponse.json(
        { success: false, message: "Too many attempts." },
        { status: 429 },
      );
    }
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 403 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 },
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" },
    );

    user.lastLogin = new Date();
    await user.save();

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            dateOfBirth: user.dateOfBirth,
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
        },
      },
      { status: 200 },
    );

    // Save JWT in httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Error logging in", error: error.message },
      { status: 500 },
    );
  }
}
