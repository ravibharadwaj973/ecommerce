// app/api/wishlist/route.js
import { NextResponse } from "next/server";
import { requireAuth } from '../auth/auth';
import Wishlist from '../models/Wishlist';
import { connectDB }  from '../config/db';

export async function GET(request) {
  try {
    await connectDB();
    
    // Use JWT authentication instead of NextAuth
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user; // Return error response if not authenticated

    const wishlist = await Wishlist.findOne({ user: user.id })
      .populate('items.product')
      .sort({ 'items.addedAt': -1 });

    if (!wishlist) {
      return Response.json({ success: true, data: { items: [] } });
    }

    return Response.json({ 
      success: true, 
      data: { 
        items: wishlist.items,
        totalItems: wishlist.items.length
      }
    });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    // Use JWT authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { productId } = await request.json();

    if (!productId) {
      return Response.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ user: user.id });

    // Check if product already exists in wishlist
    if (wishlist && wishlist.items.some(item => item.product.toString() === productId)) {
      return Response.json({ success: false, message: 'Product already in wishlist' }, { status: 400 });
    }

    if (!wishlist) {
      wishlist = new Wishlist({
        user: user.id,
        items: [{ product: productId }]
      });
    } else {
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    await wishlist.populate('items.product');

    const addedItem = wishlist.items[wishlist.items.length - 1];

    return Response.json({ 
      success: true, 
      message: 'Product added to wishlist',
      data: { item: addedItem }
    });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}