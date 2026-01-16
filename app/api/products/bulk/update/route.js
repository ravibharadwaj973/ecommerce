import { NextResponse } from "next/server";
import Product from "../../../models/Product";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth"; // ✅ using your JWT middleware

// @desc    Bulk update products
// @route   PATCH /api/products/bulk/update
// @access  Private/Admin
export async function PATCH(request) {
  try {
    await connectDB();

    // ✅ Authenticate the user
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user; // unauthorized response from middleware

    // ✅ Only admins can bulk update
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    // ✅ Parse JSON input
    const { productIds, updateData } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product IDs are required" },
        { status: 400 }
      );
    }

    if (!updateData || typeof updateData !== "object") {
      return NextResponse.json(
        { success: false, message: "updateData must be a valid object" },
        { status: 400 }
      );
    }

    // ✅ Perform bulk update using Mongoose
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: { updatedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Bulk update products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error bulk updating products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
