import Razorpay from "razorpay";
import Order from "../../models/order";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  const { orderId } = await request.json();

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const rpOrder = await razorpay.orders.create({
    amount: order.totalAmount * 100,
    currency: "INR",
    receipt: order.orderNumber,
  });

  return NextResponse.json({
    success: true,
    data: rpOrder,
  });
}
