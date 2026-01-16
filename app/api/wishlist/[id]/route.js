// app/api/wishlist/[id]/route.js
import { NextResponse } from "next/server";
import { requireAuth } from "../../auth/auth";
import Wishlist from "../../models/Wishlist";
import { connectDB } from "../../config/db";

export async function DELETE(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const params = await context.params;
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID missing" },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ user: user.id });

    if (!wishlist) {
      return NextResponse.json(
        { success: false, message: "Wishlist not found" },
        { status: 404 }
      );
    }

    const exists = wishlist.items.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return NextResponse.json({
        success: true,
        message: "Product already removed",
        data: { remainingItems: wishlist.items.length },
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
      data: { remainingItems: wishlist.items.length },
    });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
