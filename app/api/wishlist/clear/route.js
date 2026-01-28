// app/api/wishlist/clear/route.js
import { NextResponse } from "next/server";
import { requireAuth } from '../../auth/auth';
import Wishlist from '../../models/Wishlist';
import { connectDB } from '../../config/db';
export async function DELETE(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { productId } = await request.json();

    const wishlist = await Wishlist.findOne({ user: user.id });
    
    if (!wishlist) {
      return NextResponse.json({ success: false, message: "Wishlist not found" }, { status: 404 });
    }

    // Filter the items
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    // Re-populate so frontend gets the updated images/names
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "items.product",
      model: "newProduct"
    });

    // CRITICAL: You must return this JSON
    return NextResponse.json({ 
      success: true, 
      data: updatedWishlist ,
      message:"item has removed from wishlist"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}