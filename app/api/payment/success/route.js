import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import ProductVariant from "../../models/ProductVariant";
import { requireAuth } from "../../auth/auth";

// @desc    Handle payment success & deduct stock
// @route   POST /api/payments/success
// @access  Private (later: webhook)
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { orderId, transactionId } = await request.json();

    if (!orderId || !transactionId) {
      return NextResponse.json(
        { success: false, message: "orderId and transactionId are required" },
        { status: 400 }
      );
    }

    // ---------------- FIND ORDER ----------------
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ---------------- IDEMPOTENCY CHECK ----------------
    if (order.payment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Order already marked as paid",
        data: order,
      });
    }

    // ---------------- STOCK VALIDATION ----------------
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.variant);
      if (!variant) {
        return NextResponse.json(
          { success: false, message: "Variant not found" },
          { status: 404 }
        );
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for SKU ${variant.sku}`,
          },
          { status: 400 }
        );
      }
    }

    // ---------------- DEDUCT STOCK ----------------
    for (const item of order.items) {
      await ProductVariant.findByIdAndUpdate(item.variant, {
        $inc: { stock: -item.quantity },
      });
    }

    // ---------------- UPDATE ORDER ----------------
    order.status = "paid";
    order.payment.status = "paid";
    order.payment.transactionId = transactionId;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment successful, stock deducted",
      data: order,
    });
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
