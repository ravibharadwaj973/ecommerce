import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import Cart from "../../models/cart";

export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const cart = await Cart.findOne({ user: user.id });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalItems: 0,
          totalQuantity: 0,
          totalPrice: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalItems: cart.items.length,     // number of variants
        totalQuantity: cart.totalQuantity, // sum of quantities
        totalPrice: cart.totalPrice,       // cart total
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
