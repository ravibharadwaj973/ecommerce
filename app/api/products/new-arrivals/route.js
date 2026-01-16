// app/api/products/new-arrivals/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 8;

    // Get products from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch new arrival products
    const products = await Product.find({
      isPublished: true,
      stock: { $gt: 0 },
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate("category", "name")
      .sort({
        createdAt: -1,
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
    console.error("Get new arrivals error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching new arrivals",
        error: error.message,
      },
      { status: 500 }
    );
  }
}