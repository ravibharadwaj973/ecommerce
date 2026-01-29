import PDFDocument from "pdfkit";
import Order from "../../models/order";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

export async function GET(request) {
  await connectDB();
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  const order = await Order.findById(orderId).populate({
    path: "items.variant",
    populate: { path: "product" },
  });

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  doc.on("end", () => {});

  doc.fontSize(18).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.text(`Order ID: ${order.orderNumber}`);
  doc.text(`Date: ${order.createdAt.toDateString()}`);
  doc.text(`Total: ₹${order.totalAmount}`);
  doc.moveDown();

  order.items.forEach((item) => {
    doc.text(
      `${item.variant.product.name} | Qty: ${item.quantity} | ₹${item.subtotal}`
    );
  });

  doc.end();

  const pdfBuffer = Buffer.concat(chunks);
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${order.orderNumber}.pdf`,
    },
  });
}
