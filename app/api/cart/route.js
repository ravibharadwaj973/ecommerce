// POST /api/cart
import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";
import Cart from "../models/cart";
import ProductVariant from "../models/ProductVariant";

 export async function POST(request) {
  await connectDB();
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const { variantId, quantity = 1 } = await request.json();

  const variant = await ProductVariant.findById(variantId);
  if (!variant || !variant.isActive) {
    return NextResponse.json({ success: false, message: "Invalid variant" }, { status: 400 });
  }

  if (variant.stock < quantity) {
    return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
  }

  let cart = await Cart.findOne({ user: user.id });
  if (!cart) cart = await Cart.create({ user: user.id });

  const existingItem = cart.items.find(
    (i) => i.variant.toString() === variantId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = existingItem.quantity * existingItem.priceAtAddTime;
  } else {
    cart.items.push({
      variant: variantId,
      quantity,
      priceAtAddTime: variant.price,
      subtotal: variant.price * quantity,
    });
  }

  cart.totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((s, i) => s + i.subtotal, 0);

  await cart.save();

  return NextResponse.json({ success: true, data: cart });
}

export async function GET(request) {
  await connectDB();
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const cart = await Cart.findOne({ user: user.id })
    .populate({
      path: "items.variant",
      populate: { path: "product" },
    });

  return NextResponse.json({ success: true, data: cart });
}
// PUT /api/cart
export async function PUT(request) {
  await connectDB();
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  const { variantId, quantity } = await request.json();

  const cart = await Cart.findOne({ user: user.id });
  const item = cart.items.find(i => i.variant.toString() === variantId);

  if (!item) {
    return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
  }

  if (quantity === 0) {
    cart.items = cart.items.filter(i => i.variant.toString() !== variantId);
  } else {
    item.quantity = quantity;
    item.subtotal = quantity * item.priceAtAddTime;
  }

  cart.totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((s, i) => s + i.subtotal, 0);

  await cart.save();
  return NextResponse.json({ success: true, data: cart });
}
