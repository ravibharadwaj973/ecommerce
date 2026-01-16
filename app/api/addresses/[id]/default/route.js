import { NextResponse } from "next/server";
import { connectDB } from "../../../config/db";
import Address from "../../../models/Address";
import { requireAuth } from "../../../auth/auth"; // adjust if folder depth differs

// @desc    Set address as default
// @route   PATCH /api/addresses/[id]/default
// @access  Private
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const addressId = params.id;
    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address ID required" },
        { status: 400 }
      );
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (address.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to modify this address" },
        { status: 403 }
      );
    }

    // Unset any other default addresses for this user
    await Address.updateMany(
      { userId: user.id },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    return NextResponse.json({
      success: true,
      message: "Address set as default successfully",
      data: { address },
    });
  } catch (error) {
    console.error("Set default address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error setting default address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
