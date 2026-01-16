import { NextResponse } from "next/server";
import User from "../models/users";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";

// @desc    Get all users with search, filter, sort, pagination
// @route   GET /api/users
// @access  Private (Admin)
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admin can access all users
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build filter object
    const filter = {};

    // Search in name, email, and phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter
    if (role && ["customer", "admin", "vendor"].includes(role)) {
      filter.role = role;
    }

    // Active status filter
    if (isActive === "true" || isActive === "false") {
      filter.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get users with selected fields (exclude password)
    const users = await User.find(filter)
      .select("-password")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: { users },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admin can create users
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role = "customer",
      phone,
      avatar,
      dateOfBirth,
    } = body;

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: "Name, email, password and phone are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Validate role
    if (!["customer", "admin", "vendor"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Phone number must be 10-15 digits" },
        { status: 400 }
      );
    }

    // Create user (in real app, hash password before saving)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password, // You should hash this password
      role,
      phone,
      avatar,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    });

    // Return user without password
    const userResponse = await User.findById(newUser._id).select("-password");

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { user: userResponse },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}