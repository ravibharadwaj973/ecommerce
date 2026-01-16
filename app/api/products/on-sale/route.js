// app/api/products/on-sale/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";

// @desc    Get products on sale
// @route   GET /api/products/on-sale
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 8;

    // Fetch products on sale
    const products = await Product.find({
      isPublished: true,
      isOnSale: true,
      stock: { $gt: 0 },
      salePrice: { $lt: "$price" }, // Ensure sale price is less than regular price
    })
      .populate("category", "name")
      .sort({
        discountPercent: -1, // Highest discount first
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
    console.error("Get on sale products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching on sale products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}