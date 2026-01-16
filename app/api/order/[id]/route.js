
import { NextResponse } from "next/server";
import Order from "../../models/order";
import User from "../../models/users";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// @desc    Get single order by ID
// @route   GET /api/orders/[id]
// @access  Private
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = params;

    const order = await Order.findById(id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name price images");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization (only order owner or admin)
    if (
      order.userId._id.toString() !== user.id.toString() &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/[id]
// @access  Private/Admin
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Restore product stock if not cancelled
    if (order.status !== "cancelled" && order.items?.length > 0) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
