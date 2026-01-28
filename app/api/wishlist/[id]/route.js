// app/api/wishlist/[id]/route.js
import { NextResponse } from "next/server";
import { requireAuth } from "../../auth/auth";
import Wishlist from "../../models/Wishlist";
import { connectDB } from "../../config/db";
import newproduct from "../../models/newproduct"; 

export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const wishlist = await Wishlist.findOne({ user: user.id })
      .populate({
        path: 'items.product',
        model: 'newProduct' // CRITICAL: Use your specific model name
      });

    if (!wishlist) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        items: wishlist.items,
        totalItems: wishlist.items.length
      }
    });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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

    // Check if product already exists
    const exists = wishlist.items.some(item => item.product.toString() === productId);
    
    if (exists) {
      // If it exists, let's toggle it (remove it) - this is a common feature
      wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
    } else {
      // If it doesn't exist, add it
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    
    // Always re-populate before sending back to avoid "disappearing images"
    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'items.product',
      model: 'newProduct'
    });

    return NextResponse.json({ 
      success: true, 
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
      data: updatedWishlist
    });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}