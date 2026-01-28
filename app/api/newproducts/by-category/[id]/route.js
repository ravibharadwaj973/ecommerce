import { NextResponse } from "next/server";
import { connectDB } from "../../../config/db";
import newProduct from "../../../models/newproduct";
import mongoose from "mongoose";

// ---------------------------------------------------------
// @desc    Get All Products by Category ID
// @route   GET /api/products/by-category/[categoryId]
// @access  Public
// ---------------------------------------------------------
export async function GET(request, context) {
  try {
    await connectDB();

    const { id } =await context.params;
    const categoryId=id;

    // 1. Validate if categoryId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Category ID format" },
        { status: 400 }
      );
    }

    // 2. Get Query Parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("onlyActive") !== "false";
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // 3. Build the query object
    const query = { category: categoryId };
    
    // Only show active products unless specified otherwise
    if (onlyActive) {
      query.isActive = true;
    }

    // 4. Execute query
    const products = await newProduct.find(query)
      .sort({ createdAt: -1 }) // Show newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // 5. Get total count for pagination
    const total = await newProduct.countDocuments(query);

    return NextResponse.json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: products,
    });

  } catch (error) {
    console.error("Fetch products by category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching products for this category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}