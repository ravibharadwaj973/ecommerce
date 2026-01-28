import mongoose from 'mongoose';


const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newProduct', // UPDATED: Changed from 'Product' to 'NewProduct'
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
     unique:true
  },
  items: [wishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // This automatically handles createdAt and updatedAt without the .pre('save') hook
  timestamps: true 
});


export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);