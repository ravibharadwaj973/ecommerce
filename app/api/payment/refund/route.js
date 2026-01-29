import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import ProductVariant from "../../models/ProductVariant";
import { requireAuth } from "../../auth/auth";

// @desc    Refund an order and restore stock
// @route   POST /api/payments/refund
// @access  Private/Admin
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { orderId, refundReason } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.payment.status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Only paid orders can be refunded" },
        { status: 400 }
      );
    }

    // Restore stock
    for (const item of order.items) {
      await ProductVariant.findByIdAndUpdate(item.variant, {
        $inc: { stock: item.quantity },
      });
    }

    // Update order
    order.status = "cancelled";
    order.payment.status = "refunded";
    order.payment.transactionId = refundReason || "REFUNDED";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order refunded and stock restored",
      data: order,
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
