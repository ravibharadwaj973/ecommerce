import { NextResponse } from "next/server";
import Product from "../../../models/Product";
import Category from "../../../models/cartegorymodel";
import { connectDB } from "../../../config/db";

// @desc    Get products by category
// @route   GET /api/products/category/[categoryId]
// @access  Public
export async function GET(request, context) {
  try {
    await connectDB();

    const params = await context.params; // ✅ FIX: Await the promise
    console.log("Route params:", params);

    const categoryId = params?.categoryId;
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is missing in URL" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({
      category: categoryId,
      isPublished: true,
    });

    const products = await Product.find({
      category: categoryId,
      isPublished: true,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: { products },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching products by category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
