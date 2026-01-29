import crypto from "crypto";
import Order from "../../models/order";
import ProductVariant from "../../models/ProductVariant";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const orderId = event.payload.payment.entity.notes.orderId;
    const order = await Order.findById(orderId);

    if (order.payment.status !== "paid") {
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(item.variant, {
          $inc: { stock: -item.quantity },
        });
      }

      order.payment.status = "paid";
      order.status = "paid";
      await order.save();
    }
  }

  return new Response("OK");
}
