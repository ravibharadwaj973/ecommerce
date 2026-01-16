// app/api/wishlist/clear/route.js
import { NextResponse } from "next/server";
import { requireAuth } from '../../auth/auth';
import Wishlist from '../../models/Wishlist';
import { connectDB } from '../../config/db';

export async function DELETE(request) {
  try {
    await connectDB();
    
    // Use JWT authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const wishlist = await Wishlist.findOne({ user: user.id });

    if (!wishlist) {
      return Response.json({ success: false, message: 'Wishlist not found' }, { status: 404 });
    }

    wishlist.items = [];
    await wishlist.save();

    return Response.json({ 
      success: true, 
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Wishlist CLEAR error:', error);
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}