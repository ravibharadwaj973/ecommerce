// app/api/products/featured/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 8;

    // Fetch featured products
    const products = await Product.find({
      isPublished: true,
      isFeatured: true,
      stock: { $gt: 0 },
    })
      .populate("category", "name")
      .sort({
        "rating.average": -1,
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching featured products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}