
import { NextResponse } from "next/server";
import Order from "../../../models/order";
 
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = params;

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.productId", "name price");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (order.userId._id.toString() !== user.id.toString() && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // In a real implementation, you would generate a PDF invoice here
    // For now, return a mock invoice URL
    const invoiceData = {
      invoiceUrl: `/api/orders/${id}/invoice-pdf`, // This would be your PDF generation endpoint
      invoiceNumber: `INV-${order.id || order._id}`,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error generating invoice",
        error: error.message,
      },
      { status: 500 }
    );
  }
}