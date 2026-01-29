import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import { requireAuth } from "../../auth/auth";

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private (later webhook)
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { orderId, reason } = await request.json();

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

    // Idempotency
    if (order.payment.status === "failed") {
      return NextResponse.json({
        success: true,
        message: "Order already marked as failed",
        data: order,
      });
    }

    order.status = "failed";
    order.payment.status = "failed";
    order.payment.transactionId = reason || "PAYMENT_FAILED";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment failure recorded",
      data: order,
    });
  } catch (error) {
    console.error("Payment failure error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
