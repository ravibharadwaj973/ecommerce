import { NextResponse } from "next/server";
import Category from "../../../models/cartegorymodel";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";   // <-- UPDATED

// @desc    Toggle category status
// @route   PATCH /api/categories/[id]/toggle-status
// @access  Private/Admin
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // Authenticate user
    const user = await requireAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    // Find category in MongoDB
    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Toggle status
    category.isActive = !category.isActive;
    await category.save();

    return NextResponse.json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        category: {
          id: category._id,
          name: category.name,
          isActive: category.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error toggling category status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
