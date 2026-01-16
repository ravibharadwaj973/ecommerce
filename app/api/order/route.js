import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import Order from "../models/order";
import Product from "../models/Product";
import { requireAuth } from "../auth/auth";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { items, shippingAddress, totalAmount } = await request.json();

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        { success: false, message: "Valid shipping address is required" },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid total amount is required" },
        { status: 400 }
      );
    }

    // Validate each product
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isPublished) {
        return NextResponse.json(
          { success: false, message: `Product not available: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Create new order
    const order = await Order.create({
      userId: user.id,
      items,
      shippingAddress,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
    });

    // Deduct stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { order },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Get all orders (admin gets all, users only their own)
// @route   GET /api/orders
// @access  Private
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Filter options
    const filter = {};
    if (user.role !== "admin") {
      filter.userId = user.id;
    }
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

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
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
