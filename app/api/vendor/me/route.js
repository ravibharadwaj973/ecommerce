// app/api/vendors/me/route.js
import { NextResponse } from "next/server";
import Vendor from "../../models/Vendor";
import User from "../../models/users";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// @desc    Get current user's vendor profile
// @route   GET /api/vendors/me
// @access  Private (Vendor)
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Ensure user is vendor
    if (user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Access denied. Not a vendor." },
        { status: 403 }
      );
    }
    

    const vendor = await Vendor.findOne({ userId: user.id })
      .populate("userId", "name email phone role avatar dateOfBirth")
      .lean();

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { vendor },
    });

  } catch (error) {
    console.error("Get vendor profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching vendor profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Update current user's vendor profile
// @route   PUT /api/vendors/me
// @access  Private (Vendor)
// @route PUT /api/vendors/me
export async function PUT(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Ensure only vendors can update
    if (user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Access denied. Only vendors can update this." },
        { status: 403 }
      );
    }

    const vendor = await Vendor.findOne({ userId: user.id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Only these fields can be updated
    const updatableFields = [
      "storeName",
      "storeDescription",
      "storeLogo",
      "bannerImage",
      "gstNumber",
      "panNumber",
      "businessAddress",
      "payoutDetails"
    ];

    Object.keys(body).forEach(key => {
      if (updatableFields.includes(key)) {
        vendor[key] = body[key];
      }
    });

    await vendor.save();

    return NextResponse.json({
      success: true,
      message: "Vendor profile updated successfully",
      data: { vendor },
    });

  } catch (error) {
    console.error("Update vendor profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating vendor profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
