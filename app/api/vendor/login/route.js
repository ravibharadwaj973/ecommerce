// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import User from "../../models/users";
import Vendor from "../../models/Vendor";
import { connectDB } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc    Login user (works for vendors too)
// @route   POST /api/auth/login
// @access  Public
export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is deactivated" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get vendor profile if user is a vendor
    let vendorProfile = null;
    if (user.role === "vendor") {
      vendorProfile = await Vendor.findOne({ userId: user._id })
        .select('storeName storeLogo isVerified verificationStatus');
    }

    // Generate JWT token

    // User response without password
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    };
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );


const response = NextResponse.json({
  success: true,
  message: "Login successful",
  data: {
    user: userResponse,
    vendor: vendorProfile,
    token
  }
});


// Write token to cookie
response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
});

return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during login",
        error: error.message,
      },
      { status: 500 }
    );
  }
}