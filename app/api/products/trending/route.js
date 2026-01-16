// app/api/products/trending/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 8;

    // Fetch trending products based on views, sales, and wishlists
    const products = await Product.find({
      isPublished: true,
      stock: { $gt: 0 },
      $or: [
        { viewCount: { $gt: 100 } },
        { salesCount: { $gt: 10 } },
        { wishlistCount: { $gt: 5 } }
      ]
    })
      .populate("category", "name")
      .sort({
        trendingScore: -1,
        viewCount: -1,
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
    console.error("Get trending products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching trending products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}