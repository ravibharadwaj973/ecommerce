// app/api/products/low-stock/route.js
import { NextResponse } from "next/server";
import Product from "../../../models/Product";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private (Admin/Vendor)
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 20;

    // Fetch low stock products
    const products = await Product.find({
      isPublished: true,
      stock: { $gt: 0, $lte: 10 }, // Stock between 1-10
    })
      .populate("category", "name")
      .sort({
        stock: 1, // Lowest stock first
        salesCount: -1,
      })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    console.error("Get low stock products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching low stock products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}