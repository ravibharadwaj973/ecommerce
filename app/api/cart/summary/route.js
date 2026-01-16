import { NextResponse } from "next/server";
import Cart from "../../models/cart";
import Product from "../../models/Product";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import mongoose from "mongoose";
//api/cart/summary
// Helper — Enrich cart items with product info
// Helper: enrich cart items with product details
const enrichCartItems = async (items) => {
  if (!items || Object.keys(items).length === 0) return {};

  const enriched = {};
console.log(items)
  for (const productId in items) {
    enriched[productId] = {};
console.log(productId)
    for (const size in items[productId]) {
      const item = items[productId][size];

      // 🔒 Defensive guard
      if (!item || typeof item.quantity !== "number") continue;

      enriched[productId][size] = {
        quantity: item.quantity,
        price: item.price,
        available: item.available,
      };
    }
  }

  return enriched;
};

// @desc    Get cart summary (count and total)
// @route   GET /api/cart/summary
// @access  Private
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const cart = await Cart.findOne({ userId: user.id });

    if (!cart || !cart.items) {
      return NextResponse.json({
        success: true,
        data: { totalItems: 0, totalAmount: 0, itemsCount: 0 },
      });
    }

    const enrichedItems = await enrichCartItems(cart.items);
// console.log(cart.items)
    let totalItems = 0;
    let totalAmount = 0;
    let itemsCount = 0;
// console.log(enrichedItems)
    for (const productId in enrichedItems) {
      for (const size in enrichedItems[productId]) {
        const item = enrichedItems[productId][size];
        console.log(item)
        totalItems += item.quantity;
        totalAmount += item.price * item.quantity;
        itemsCount++;
      }
    }


    return NextResponse.json({
      success: true,
      data: {
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2)),
        itemsCount,
      },
    });
  } catch (error) {
    console.error("Get cart summary error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching cart summary" },
      { status: 500 }
    );
  }
}
