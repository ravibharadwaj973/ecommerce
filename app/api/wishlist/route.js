// app/api/wishlist/route.js
import { NextResponse } from "next/server";
import { requireAuth } from "../auth/auth";
import Wishlist from "../models/Wishlist";
import { connectDB } from "../config/db";

export async function GET(request) {
  try {
    await connectDB();

    // Use JWT authentication instead of NextAuth
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user; // Return error response if not authenticated

    const wishlist = await Wishlist.findOne({ user: user.id }).populate({
      path: "items.product",
      model: "newProduct", // Explicitly tell Mongoose which model to use for population
    });
    if (!wishlist) {
      return Response.json({ success: true, data: { items: [] } });
    }

    return Response.json({
      success: true,
      data: {
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ user: user.id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: user.id, items: [] });
    }

    const exists = wishlist.items.some(item => item.product.toString() === productId);
    let message = "";

    if (exists) {
      wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
      message = "Removed from wishlist";
    } else {
      wishlist.items.push({ product: productId });
      message = "Added to wishlist";
    }

    await wishlist.save();

    // 2. RE-FETCH AND POPULATE PROPERLY
    // We use path and model to force Mongoose to use 'newProduct'
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'items.product',
      model: 'newProduct' 
    });

    return NextResponse.json({ 
      success: true, 
      message: message,
      data: updatedWishlist 
    });

  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}