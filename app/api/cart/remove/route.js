import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Cart from "../../models/cart";
import Product from "../../models/Product";
import { requireAuth } from "../../auth/auth";

// Helper: enrich cart items
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

// @desc Remove one product (or size) from the user's cart
// @route POST /api/cart/remove
// @access Private
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { itemId, size } = await request.json();
    const userId = user.id;


    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    // Work on a safe copy
    const items = JSON.parse(JSON.stringify(cart.items || {}));

    // Remove the specified item/size
    if (items[itemId] && items[itemId][size]) {
      delete items[itemId][size];
      if (Object.keys(items[itemId]).length === 0) delete items[itemId];
    }

    // Filter invalid keys
    const plainItems = Object.fromEntries(
      Object.entries(items).filter(([key]) => !key.startsWith("$"))
    );

    await Cart.findByIdAndUpdate(cart._id, { items: plainItems });

    const enriched = await enrichCartItems(plainItems);

    return NextResponse.json({
      success: true,
      message: "Item removed from cart successfully",
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
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { success: false, message: "Error removing item from cart", error: error.message },
      { status: 500 }
    );
  }
}
