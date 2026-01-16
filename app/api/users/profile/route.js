import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "../../config/db";
import User from "../../models/users";

async function getUserFromToken(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    return decoded;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile
export async function GET(request) {
  try {
    await connectDB();

    const decoded = await getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching profile", error: error.message },
      { status: 500 }
    );
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
export async function PUT(request) {
  try {
    await connectDB();

    const decoded = await getUserFromToken(request);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { name, phone, dateOfBirth, avatar } = await request.json();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.avatar = avatar || user.avatar;

    await user.save();

    const updatedUser = await User.findById(decoded.id).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating profile", error: error.message },
      { status: 500 }
    );
  }
}
