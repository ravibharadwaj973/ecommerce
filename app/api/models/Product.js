import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
      default: null,
    },
    // 🆕 Sale-related fields
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      default: null,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    saleStartDate: {
      type: Date,
      default: null,
    },
    saleEndDate: {
      type: Date,
      default: null,
    },
    discountPercent: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    // 🏷️ Product organization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    brand: {
      type: String,
      trim: true,
      index: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    // 🆕 NEW FIELDS FOR PRODUCTION
    salesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    lastSoldAt: {
      type: Date,
      default: null
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    priceRange: {
      type: String,
      enum: ['under-50', '50-100', '100-200', '200-500', '500-plus'],
      default: 'under-50'
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'all-season'],
      default: 'all-season'
    },
    isLimitedEdition: {
      type: Boolean,
      default: false
    },
    isBackorder: {
      type: Boolean,
      default: false
    },
    estimatedRestockDate: {
      type: Date,
      default: null
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    // 🖼️ Cloudinary Images
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        format: { type: String, default: null },
        bytes: { type: Number, default: null },
        isPrimary: { type: Boolean, default: false },
        altText: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true
    },
    // 📊 Ratings and reviews
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    // 🔒 Publishing and ownership
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // 📈 Analytics fields
    viewCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🎯 Virtual for checking if sale is currently active
productSchema.virtual('isSaleActive').get(function() {
  if (!this.isOnSale || !this.salePrice) return false;
  const now = new Date();
  const startValid = !this.saleStartDate || this.saleStartDate <= now;
  const endValid = !this.saleEndDate || this.saleEndDate >= now;
  return startValid && endValid;
});

// 🎯 Virtual for current price
productSchema.virtual('currentPrice').get(function() {
  return this.isSaleActive && this.salePrice ? this.salePrice : this.price;
});

// 🎯 Virtual for saving amount
productSchema.virtual('savingAmount').get(function() {
  if (!this.isSaleActive || !this.salePrice) return 0;
  return this.price - this.salePrice;
});

// 🆕 NEW VIRTUAL FIELDS
productSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.virtual('isNewArrival').get(function() {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreation <= 30;
});

productSchema.virtual('isOutOfStock').get(function() {
  return this.stock === 0 && !this.isBackorder;
});

// 🖼️ Image virtuals (your existing ones)
productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img?.isPrimary);
  const selected = primary || this.images[0];
  return selected?.url || null;
});

productSchema.virtual('thumbnail').get(function() {
  const image = this.primaryImage;
  if (!image) return null;
  return image.replace('/upload/', '/upload/w_300,h_300,c_fill/');
});

// 🎯 Enhanced Pre-save Middleware
productSchema.pre('save', function(next) {
  // Discount logic
  if (this.salePrice && this.price > this.salePrice) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
    this.isOnSale = true;
  } else {
    this.discountPercent = 0;
    this.isOnSale = false;
  }

  // Calculate trending score
  this.trendingScore = (this.salesCount * 3) + (this.viewCount * 0.1) + (this.wishlistCount * 2);
  
  // Auto-set price range
  const price = this.currentPrice || this.price;
  if (price < 50) this.priceRange = 'under-50';
  else if (price <= 100) this.priceRange = '50-100';
  else if (price <= 200) this.priceRange = '100-200';
  else if (price <= 500) this.priceRange = '200-500';
  else this.priceRange = '500-plus';

  // Ensure only one primary image exists
  if (this.images && this.images.length > 0) {
    let foundPrimary = false;
    this.images = this.images.map(img => {
      if (img.isPrimary) {
        if (foundPrimary) {
          img.isPrimary = false;
        } else {
          foundPrimary = true;
        }
      }
      return img;
    });
    
    // If no primary found, set first as primary
    if (!foundPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// 🆕 NEW STATIC METHODS
productSchema.statics.getBestSellers = function(limit = 10) {
  return this.find({ 
    isPublished: true, 
    isActive: true,
    salesCount: { $gt: 0 }
  })
  .sort({ salesCount: -1, trendingScore: -1 })
  .limit(limit)
  .select('name price images rating salesCount discountPercent isOnSale');
};

productSchema.statics.getNewArrivals = function(limit = 10) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.find({ 
    isPublished: true,
    isActive: true,
    createdAt: { $gte: thirtyDaysAgo }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('name price images rating createdAt discountPercent isOnSale');
};

productSchema.statics.getTrendingProducts = function(limit = 10) {
  return this.find({ 
    isPublished: true, 
    isActive: true 
  })
  .sort({ trendingScore: -1, viewCount: -1 })
  .limit(limit)
  .select('name price images rating trendingScore discountPercent isOnSale');
};

productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({ 
    isPublished: true, 
    isActive: true,
    isFeatured: true 
  })
  .sort({ trendingScore: -1, createdAt: -1 })
  .limit(limit)
  .select('name price images rating isFeatured discountPercent isOnSale');
};

productSchema.statics.getLowStockProducts = function(limit = 10) {
  return this.find({ 
    isPublished: true,
    isActive: true,
    stock: { $gt: 0, $lte: 10 }
  })
  .sort({ stock: 1 })
  .limit(limit)
  .select('name price images stock lowStockThreshold discountPercent isOnSale');
};

// 🆕 NEW INSTANCE METHODS
productSchema.methods.incrementSales = function(quantity = 1) {
  this.salesCount += quantity;
  this.purchaseCount += quantity;
  this.stock = Math.max(0, this.stock - quantity);
  this.lastSoldAt = new Date();
  return this.save();
};

productSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

productSchema.methods.updateRating = function(newRating) {
  // Implementation for updating rating distribution
  return this.save();
};

// Indexes for better performance
productSchema.index({ isPublished: 1, isActive: 1, trendingScore: -1 });
productSchema.index({ category: 1, isPublished: 1, price: 1 });
productSchema.index({ brand: 1, isPublished: 1 });
productSchema.index({ tags: 1, isPublished: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;