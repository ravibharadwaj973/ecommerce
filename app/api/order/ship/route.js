import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Order from "@/models/Order";
import { requireAuth } from "@/auth/auth";

export async function POST(request) {
  await connectDB();
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  if (user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Admin only" }, { status: 403 });
  }

  const { orderId, carrier, trackingNumber } = await request.json();

  const order = await Order.findById(orderId);o
  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  order.shipment = {
    carrier,
    trackingNumber,
    status: "shipped",
    shippedAt: new Date(),
  };

  order.status = "shipped";
  await order.save();

  return NextResponse.json({ success: true, message: "Order shipped", data: order });
}
