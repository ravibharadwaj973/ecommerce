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
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { type, street, city, state, zipCode, country, isDefault } =
      await request.json();

    // Validate required fields
    if (!street || !city || !state || !zipCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Street, city, state, and zip code are required",
        },
        { status: 400 }
      );
    }

    // If the new address is default, unset any existing default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: user.id },
        { $set: { isDefault: false } }
      );
    }

    // Create new address
    const address = await Address.create({
      userId: user.id,
      type: type || "home",
      street,
      city,
      state,
      zipCode,
      country: country || "US",
      isDefault: isDefault || false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: { address },
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

// @desc Get all addresses for a user
// @route GET /api/addresses
// @access Private
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const addresses = await Address.find({ userId: user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: { addresses },
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
