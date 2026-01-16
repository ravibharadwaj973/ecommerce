// app/api/fix-index/route.js (Temporary route - remove after use)
import {connectDB} from '../config/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    // Drop the problematic index
    await mongoose.connection.collection('products').dropIndex('id_1');
    
    return Response.json({ 
      success: true, 
      message: 'Index dropped successfully' 
    });
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      return Response.json({ 
        success: true, 
        message: 'Index already removed' 
      });
    }
    return Response.json({ 
      success: false, 
      message: 'Error dropping index',
      error: error.message 
    });
  }
}