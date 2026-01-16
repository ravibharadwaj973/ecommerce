import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";

export async function POST(request) {
  try {
    await connectDB();
    const { amount } = await request.json(); // amount in INR

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { success: false, message: "Payment order failed" },
      { status: 500 }
    );
  }
}
