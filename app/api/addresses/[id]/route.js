import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Address from "../../models/Address";
import { requireAuth } from "../../auth/auth";


// @desc    Update address
// @route   PUT /api/addresses/[id]
// @access  Private
export async function PATCH(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // ✅ FIX: params is already an object
    const   {id:addressId}  = await context.params;

    // ✅ Safe body read
    const body = await request.clone().json();

    const allowedFields = [
      "label",
      "fullName",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "postalCode",
      "country",
      "isDefault",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }
  const addresscpy = await Address.findById(addressId);

    if (!addresscpy) {
      return NextResponse.json(
        { success: false, message: "Addreskjhkjds not found" },
        { status: 404 }
      );
    }
    // 🔐 Ownership check
    const address = await Address.findOne({
      _id: addressId,      // ✅ now a string
      user: user.id,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    Object.assign(address, updateData);
    await address.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: address,
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
// @desc    Delete an address
// @route   DELETE /api/addresses/[id]
// @access  Private
export async function DELETE(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id: addressId } = await context.params;

    // 🔐 Secure ownership + existence check in ONE query
    const address = await Address.findOne({
      _id: addressId,
      user: user.id,
    });

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
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

