import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import Address from "../models/Address";
import { requireAuth } from "../auth/auth";

// @desc Create a new address
// @route POST /api/addresses
// @access Private
export async function POST(request) {
  try {
    await connectDB();

    // 🔐 Auth (must not read request body)
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // ✅ CLONE REQUEST BEFORE READING BODY
    const body = await request.clone().json();

    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = body;

    // ---------------- VALIDATION ----------------
    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "fullName, phone, addressLine1, city, state, and postalCode are required",
        },
        { status: 400 }
      );
    }

    // ---------------- CREATE ADDRESS ----------------
    const address = await Address.create({
      user: user.id,                 // ✅ correct field
      label: label || "home",
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      postalCode,
      country: country || "IN",
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Get all addresses for logged-in user
// @route   GET /api/addresses
// @access  Private
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const addresses = await Address.find({ user: user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching addresses",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

