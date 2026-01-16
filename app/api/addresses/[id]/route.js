import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Address from "../../models/Address";
import { requireAuth } from "../../auth/auth";

// @desc    Get address by ID
// @route   GET /api/addresses/[id]
// @access  Private
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const address = await Address.findById(params.id);
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    if (address.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view this address" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { address },
    });
  } catch (error) {
    console.error("Get address by ID error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Update address
// @route   PUT /api/addresses/[id]
// @access  Private
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { type, street, city, state, zipCode, country, isDefault } =
      await request.json();

    const address = await Address.findById(params.id);
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    if (address.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this address" },
        { status: 403 }
      );
    }

    // If setting as default, unset other defaults first
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: user.id },
        { $set: { isDefault: false } }
      );
    }

    // Update the address
    address.type = type || address.type;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.isDefault =
      isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: { address },
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete address
// @route   DELETE /api/addresses/[id]
// @access  Private
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const address = await Address.findById(params.id);
    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    if (address.userId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this address" },
        { status: 403 }
      );
    }

    await address.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
