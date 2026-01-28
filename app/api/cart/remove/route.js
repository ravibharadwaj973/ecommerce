import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import Cart from "../../models/cart";

export async function DELETE(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { variantId } = await request.json();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });

    // 1. Remove the item
    cart.items = cart.items.filter(
      (item) => item.variant.toString() !== variantId.toString()
    );

    // 2. Recalculate totals
    cart.totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((s, i) => s + i.subtotal, 0);

    // 3. Save the changes
    await cart.save();

    // 4. CRITICAL FIX: Re-populate so the frontend doesn't lose images/names
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.variant",
      populate: { 
        path: "product",
        model: "newProduct" // Match your schema name here
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Item removed", 
      data: updatedCart 
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
