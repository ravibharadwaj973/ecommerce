import { NextResponse } from "next/server";
import Review from "../../../models/Review";
import User from "../../..//models/users";
import Product from "../../../models/Product";
import { connectDB } from "../../../config/db";

// @desc    Get reviews for a specific product
// @route   GET /api/products/[id]/reviews
// @access  Public
export async function GET(request, context) {
  try {
    await connectDB();

    const params = await context.params;
    const productId = params?.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is missing in URL" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const ratingFilter = parseInt(searchParams.get("rating"));
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // ✅ Check if product exists
    const product = await Product.findById(productId).select("name rating");
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Build filter
    const filter = { product: productId, isApproved: true };
    if (!isNaN(ratingFilter)) {
      filter.rating = ratingFilter;
    }

    const skip = (page - 1) * limit;

    // ✅ Get reviews with user info
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar") // populate user info
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Review.countDocuments(filter),
    ]);

    // ✅ Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { product: product._id, isApproved: true } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        product,
        reviews,
        ratingStats,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching product reviews",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
