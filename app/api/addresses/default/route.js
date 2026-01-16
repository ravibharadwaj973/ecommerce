import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Address from "../../models/Address";
import { requireAuth } from "../../auth/auth";

// @desc    Get user's default address
// @route   GET /api/addresses/default
// @access  Private
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const defaultAddress = await Address.findOne({
      userId: user.id,
      isDefault: true,
    });

    if (!defaultAddress) {
      return NextResponse.json(
        { success: false, message: "No default address found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { address: defaultAddress },
    });
  } catch (error) {
    console.error("Get default address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching default address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
