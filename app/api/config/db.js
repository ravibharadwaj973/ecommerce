import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

let isConnected = false;

export const connectDB = async () => {
  // If already connected, return immediately
  // console.log(MONGODB_URI)
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return true;
  }

  // If in development and no MONGODB_URI, use mock mode
  if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI) {
    console.log('📝 Development: Using mock database mode');
    return true;
  }

  try {
    console.log('🔍 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      // Remove deprecated options for newer MongoDB
    });

    isConnected = true;
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`🗃️ Database: ${conn.connection.name}`);
    
    return true;
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    
    // In development, fall back to mock mode
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Falling back to mock database mode');
      return true;
    }
    
    return false;
  }
};

export default mongoose;