import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { requireAuth } from "@/auth/auth";
import Cart from "@/models/Cart";

export async function DELETE(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { variantId } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { success: false, message: "variantId is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item) => item.variant.toString() !== variantId
    );

    // Recalculate totals
    cart.totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);
    cart.totalPrice = cart.items.reduce((s, i) => s + i.subtotal, 0);

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
