
import { NextResponse } from "next/server";
import Order from "../../../models/order";

import Product from "../../../models/Product";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";
// @desc    Cancel order
// @route   PATCH /api/orders/[id]/cancel
// @access  Private (User or Admin)
export async function PATCH(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

      const { id } = await context.params;
console.log(id)
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin privilege
    if (
      order.userId.toString() !== user.id.toString() &&
      user.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized to cancel this order" },
        { status: 403 }
      );
    }

    // Prevent canceling shipped/delivered orders
    if (["shipped", "delivered"].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot cancel order that is already shipped or delivered",
        },
        { status: 400 }
      );
    }

    // Prevent re-cancel
    if (order.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // Update order status and payment state
    order.status = "cancelled";
    order.paymentStatus =
      order.paymentStatus === "paid" ? "refunded" : "failed";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error cancelling order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
