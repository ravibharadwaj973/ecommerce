// app/api/products/best-sellers/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";

// @desc    Get best selling products
// @route   GET /api/products/best-sellers
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 8;

    // Fetch best selling products
    const products = await Product.find({
      isPublished: true,
      stock: { $gt: 0 },
      salesCount: { $gt: 0 }, // Only products that have been sold
    })
      .populate("category", "name")
      .sort({
        salesCount: -1,
        "rating.average": -1,
      })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    console.error("Get best sellers error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching best sellers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}