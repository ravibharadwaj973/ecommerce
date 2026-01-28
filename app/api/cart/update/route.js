import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import Cart from "../../models/cart";
import ProductVariant from "../../models/ProductVariant";

export async function PATCH(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { variantId, quantity } = await request.json();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart)
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );

    // FIX: Convert both sides to string to ensure they match
    const itemIndex = cart.items.findIndex(
      (item) => item.variant.toString() === variantId,
    );
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found in cart" },
        { status: 404 },
      );
    }

    // Update quantity and subtotal
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal =
      quantity * cart.items[itemIndex].priceAtAddTime;
    // Recalculate cart totals
    cart.totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

    await cart.save();
const updatedCart = await Cart.findById(cart._id).populate({
  path: "items.variant",
  populate: { 
    path: "product", 
    model: "newProduct" // Use your actual Model name here
  }
});
    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
