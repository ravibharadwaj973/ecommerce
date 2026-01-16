// app/api/vendors/route.js
import { NextResponse } from "next/server";
import Vendor from "../models/Vendor";
import User from "../models/User";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";

// @desc    Get all vendors (Admin only - for verification management)
// @route   GET /api/vendors
// @access  Private/Admin
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can view all vendors" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "active", "inactive"
    const verification = searchParams.get("verification"); // "pending", "approved", "rejected"

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Search by store name or email
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } }
      ];
    }

    // Filter by status
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Filter by verification status
    if (verification) {
      query.verificationStatus = verification;
    }

    // Get vendors with user details and documents
    const vendors = await Vendor.find(query)
      .populate("userId", "email firstName lastName phone")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Vendor.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: { vendors },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get vendors error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching vendors",
        error: error.message,
      },
      { status: 500 }
    );
  }
}