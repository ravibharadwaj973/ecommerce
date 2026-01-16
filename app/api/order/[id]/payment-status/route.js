 
import { NextResponse } from "next/server";
import Order from "../../../models/order";
 
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";
// @desc    Update payment status
// @route   PATCH /api/orders/[id]/payment-status
// @access  Private/Admin
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admins can update payment status
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { paymentStatus } = await request.json();

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
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

    // Update payment status
    order.paymentStatus = paymentStatus;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating payment status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
