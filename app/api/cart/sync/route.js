import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Cart from "../../models/cart";
import Product from "../../models/Product";
import { requireAuth } from "../../auth/auth";

// Helper: enrich cart items with product info
const enrichCartItems = async (items) => {
  if (!items || Object.keys(items).length === 0) return {};

  const productIds = Object.keys(items);
  const products = await Product.find({
    _id: { $in: productIds },
    isPublished: true,
  }).select("name price images stock sizes");

  const productMap = {};
  products.forEach((p) => (productMap[p._id.toString()] = p));

  const enriched = {};
  for (const pid in items) {
    const product = productMap[pid];
    if (!product) continue;

    enriched[pid] = {};
    for (const size in items[pid]) {
      const quantity = items[pid][size];
      enriched[pid][size] = {
        quantity,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        stock: product.stock,
        available: product.stock >= quantity,
        size,
      };
    }
  }

  return enriched;
};

// @desc Merge guest cart into user cart after login
// @route POST /api/cart/sync
// @access Private
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { guestCart } = await request.json();
    const userId = user.id;

    if (!guestCart || typeof guestCart !== "object") {
      return NextResponse.json(
        { success: false, message: "Valid guest cart data is required" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: {} });
    }

    // Merge guest cart into user cart
    const mergedItems = JSON.parse(JSON.stringify(cart.items || {}));
    for (const productId in guestCart) {
      for (const size in guestCart[productId]) {
        const guestQty = guestCart[productId][size];
        if (!mergedItems[productId]) mergedItems[productId] = {};
        const currQty = mergedItems[productId][size] || 0;
        mergedItems[productId][size] = currQty + guestQty;
      }
    }

    // Clean any $ keys before saving
    const plainItems = Object.fromEntries(
      Object.entries(mergedItems).filter(([key]) => !key.startsWith("$"))
    );

    await Cart.findByIdAndUpdate(cart._id, { items: plainItems });

    const enriched = await enrichCartItems(plainItems);

    return NextResponse.json({
      success: true,
      message: "Cart synced successfully",
      data: {
        cart: {
          id: cart._id,
          userId,
          items: enriched,
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Sync cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error syncing cart", error: error.message },
      { status: 500 }
    );
  }
}
