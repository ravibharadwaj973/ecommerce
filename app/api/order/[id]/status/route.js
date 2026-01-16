import { NextResponse } from "next/server";
import Order from "../../../models/order";
import User from "../../../models/users";
import Product from "../../../models/Product";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";
// @desc    Update order status
// @route   PATCH /api/orders/[id]/status
// @access  Private/Admin
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admin can update order status
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status } = await request.json();

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // If cancelling, restore product stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Update order status
    order.status = status;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating order status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
