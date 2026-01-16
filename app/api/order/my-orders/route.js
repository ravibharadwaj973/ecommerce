import { NextResponse } from "next/server";
import Order from "../../models/order";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "ASC" ? 1 : -1;

    const query = { userId: user.id };

    // Status filter
    if (status) query.status = status;

    // Search filter
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Fetch orders with population
    const orders = await Order.find(query)
      .populate('items.productId', 'name price images')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total
    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: { orders },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching your orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}