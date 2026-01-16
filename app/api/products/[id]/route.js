import { NextResponse } from "next/server";
import Product from "../../models/Product";
import Category from "../../models/cartegorymodel";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get single product by ID
// @route   GET /api/products/[id]
// @access  Public
export async function GET(request, context) {
  try {
    await connectDB();

    const params = await context.params;
    const productId = params?.id;
    // console.log(productId)

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is missing in URL" },
        { status: 400 }
      );
    }

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).populate(
      "category",
      "name description"
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // If product unpublished → only admin/vendor can access
    if (!product.isPublished) {
      const user = await requireAuth(request);
      if (user instanceof NextResponse) return user;
      if (user.role !== "admin" && user.role !== "vendor") {
        return NextResponse.json(
          { success: false, message: "Product not available" },
          { status: 403 }
        );
      }
    }

    // Convert to plain object to safely manipulate data
    const productData = product.toObject ? product.toObject() : { ...product };

    // SAFELY handle images - handle both string and object formats
    if (productData.images && Array.isArray(productData.images)) {
      productData.images = productData.images.map((img, index) => {
        // If image is a string (old format), convert to object
        if (typeof img === 'string') {
          return {
            url: img,
            isPrimary: index === 0, // First image becomes primary
            altText: productData.name || 'Product image',
            // Add other required fields with defaults
            publicId: `legacy_${productId}_${index}`,
            createdAt: new Date()
          };
        }
        
        // If image is already an object, ensure it has required fields
        if (typeof img === 'object' && img !== null) {
          return {
            url: img.url || '',
            publicId: img.publicId || `img_${productId}_${index}`,
            isPrimary: img.isPrimary || false,
            altText: img.altText || productData.name || 'Product image',
            width: img.width || null,
            height: img.height || null,
            format: img.format || null,
            bytes: img.bytes || null,
            createdAt: img.createdAt || new Date(),
            // Preserve any other properties
            ...img
          };
        }
        
        // Fallback for invalid image data
        return {
          url: '',
          isPrimary: false,
          altText: 'Invalid image data',
          publicId: `invalid_${index}`,
          createdAt: new Date()
        };
      });
    } else {
      // Ensure images array exists even if empty
      productData.images = [];
    }

    // Calculate current price based on sale status
    const now = new Date();
    const isSaleActive = productData.isOnSale && 
                        productData.salePrice && 
                        (!productData.saleStartDate || productData.saleStartDate <= now) &&
                        (!productData.saleEndDate || productData.saleEndDate >= now);

    productData.currentPrice = isSaleActive ? productData.salePrice : productData.price;
    productData.isSaleActive = isSaleActive;
    
    if (isSaleActive && productData.price) {
      productData.savingAmount = productData.price - productData.salePrice;
      productData.discountPercent = Math.round((productData.savingAmount / productData.price) * 100);
    } else {
      productData.savingAmount = 0;
      productData.discountPercent = 0;
    }

    // Get primary image safely
    productData.primaryImage = productData.images.find(img => img.isPrimary) || 
                              productData.images[0] || 
                              null;

    // Increment view count (don't await to speed up response)
    Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } })
      .catch(err => console.error('Error incrementing view count:', err));

    return NextResponse.json({
      success: true,
      data: { 
        product: productData,
        // Add helpful metadata
        metadata: {
          hasImages: productData.images.length > 0,
          imageCount: productData.images.length,
          primaryImageSet: !!productData.primaryImage,
          inStock: productData.stock > 0,
          lowStock: productData.stock > 0 && productData.stock <= 10
        }
      },
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Handle image format errors specifically
    if (error.message.includes('Cannot create field') && error.message.includes('isPrimary')) {
      // Try to fetch product without population and handle manually
      try {
        const rawProduct = await Product.findById(productId);
        if (rawProduct) {
          // Use the safe conversion logic from above
          const productData = rawProduct.toObject();
          // ... apply the same image conversion logic
          // Return the safe version
        }
      } catch (fallbackError) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Product data format issue",
            error: "Image data corruption detected"
          },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching product details",
        // Don't expose internal errors in production
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// @desc    Update product
// @route   PUT /api/products/[id]
// @access  Private/Admin/Vendor
export async function PUT(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin" && user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const productId = (await context.params)?.id;
    const formData = await request.formData();
    console.log(productId)

const existingProduct = await Product.findById( productId );
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Extract updates from form data
    const updates = {};
    
    // Text fields
    const textFields = ['name', 'description', 'brand'];
    textFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) updates[field] = value;
    });

    // Number fields
    const numberFields = ['price', 'comparePrice', 'salePrice', 'stock'];
    numberFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) updates[field] = parseFloat(value);
    });

    // Boolean fields
    const booleanFields = ['isPublished', 'isOnSale', 'isFeatured', 'isActive'];
    booleanFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) updates[field] = value === 'true';
    });

    // Array fields
    const arrayFields = ['sizes', 'colors', 'features', 'tags'];
    arrayFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) updates[field] = JSON.parse(value);
    });

    // Date fields
    const dateFields = ['saleStartDate', 'saleEndDate'];
    dateFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) updates[field] = value ? new Date(value) : null;
    });

    // Handle new image uploads
    const newImageFiles = formData.getAll('newImages');
    if (newImageFiles.length > 0) {
      const uploadedImages = [];
      
      for (const imageFile of newImageFiles) {
        if (imageFile instanceof File && imageFile.size > 0) {
          try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const result = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: 'ecommerce/products',
                  transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto' },
                    { format: 'webp' }
                  ]
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            });

            uploadedImages.push({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              isPrimary: false, // New images are not primary by default
              altText: updates.name || existingProduct.name
            });
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
          }
        }
      }
      
      if (uploadedImages.length > 0) {
        updates.$push = { images: { $each: uploadedImages } };
      }
    }

    // Handle image deletions
    const imagesToDelete = formData.get('imagesToDelete');
    if (imagesToDelete) {
      const publicIds = JSON.parse(imagesToDelete);
      
      // Delete from Cloudinary
      if (publicIds.length > 0) {
        const deletePromises = publicIds.map(publicId => 
          cloudinary.uploader.destroy(publicId)
        );
        await Promise.all(deletePromises);
      }
      
      // Remove from database
      updates.$pull = { 
        images: { publicId: { $in: publicIds } } 
      };
    }

    // Handle primary image change
    const primaryImageId = formData.get('primaryImageId');
    if (primaryImageId) {
      // This requires a separate operation after the main update
      existingProduct.images.forEach(img => {
        img.isPrimary = img.publicId === primaryImageId;
      });
    }

    // Handle SKU update with duplicate check
    if (updates.sku && updates.sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ 
        sku: updates.sku,
        _id: { $ne: productId }
      });
      if (skuExists) {
        return NextResponse.json(
          { success: false, message: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    // Handle category change
    if (updates.categoryId) {
      const category = await Category.findById(updates.categoryId);
      if (!category) {
        return NextResponse.json(
          { success: false, message: "Invalid categoryId" },
          { status: 400 }
        );
      }
      updates.category = updates.categoryId;
      delete updates.categoryId;

      // Update category references
      await Category.findByIdAndUpdate(existingProduct.category, {
        $pull: { products: productId }
      });
      await Category.findByIdAndUpdate(updates.category, {
        $push: { products: productId }
      });
    }

    // Apply updates
    Object.assign(existingProduct, updates);
    const updatedProduct = await existingProduct.save();

    await updatedProduct.populate("category", "name description");

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete product
// @route   DELETE /api/products/[id]
// @access  Private/Admin/Vendor
export async function DELETE(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin" && user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const productId = (await context.params)?.id;
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // SAFELY delete images from Cloudinary (only if public_id exists)
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (image) => {
        // Skip if image is a string (no public_id available)
        if (typeof image === 'string') {
          console.log('Skipping Cloudinary delete - image is string format');
          return { skipped: true, reason: 'string_format' };
        }

        // Skip if public_id is missing or invalid
        if (!image.publicId || image.publicId === '') {
          console.log('Skipping Cloudinary delete - missing public_id for image');
          return { skipped: true, reason: 'missing_public_id' };
        }

        // Skip if public_id indicates it's a legacy/migrated image
        if (image.publicId.startsWith('legacy_') || image.publicId.startsWith('migrated_')) {
          console.log('Skipping Cloudinary delete - legacy image:', image.publicId);
          return { skipped: true, reason: 'legacy_image' };
        }

        // Only delete from Cloudinary if we have a valid public_id
        try {
          const cloudinary = await import('cloudinary');
          cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          const result = await cloudinary.v2.uploader.destroy(image.publicId);
          console.log('✅ Cloudinary delete success for public_id:', image.publicId, result);
          return { success: true, publicId: image.publicId, result };
        } catch (cloudinaryError) {
          console.warn('❌ Cloudinary delete failed for public_id:', image.publicId, cloudinaryError.message);
          // Don't fail the entire deletion if Cloudinary fails
          return { 
            success: false, 
            publicId: image.publicId, 
            error: cloudinaryError.message 
          };
        }
      });

      // Wait for all image deletions and log results
      const deleteResults = await Promise.all(deletePromises);
      
      // Log summary
      const successfulDeletes = deleteResults.filter(r => r.success).length;
      const skippedDeletes = deleteResults.filter(r => r.skipped).length;
      const failedDeletes = deleteResults.filter(r => !r.success && !r.skipped).length;
      
      console.log(`📊 Cloudinary delete summary: ${successfulDeletes} successful, ${skippedDeletes} skipped, ${failedDeletes} failed`);
    } else {
      console.log('ℹ️ No images to delete from Cloudinary');
    }

    // Delete product from database
    await Product.findByIdAndDelete(productId);

    // Remove product from category (safely)
    if (product.category) {
      try {
        await Category.findByIdAndUpdate(product.category, {
          $pull: { products: productId }
        });
        console.log('✅ Removed product from category');
      } catch (categoryError) {
        console.warn('⚠️ Failed to remove product from category:', categoryError.message);
        // Continue even if category update fails
      }
    }

    // Optional: Remove product from any user wishlists
    try {
      const Wishlist = (await import('../../models/Wishlist')).default;
      await Wishlist.updateMany(
        { 'items.product': productId },
        { $pull: { items: { product: productId } } }
      );
      console.log('✅ Removed product from user wishlists');
    } catch (wishlistError) {
      console.warn('⚠️ Failed to remove product from wishlists:', wishlistError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      // Include debug info in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          productId,
          hadImages: product.images?.length > 0,
          imageCount: product.images?.length || 0
        }
      })
    });
  } catch (error) {
    console.error("Delete product error:", error);
    
    // Handle specific error types
    if (error.message.includes('Missing required parameter - public_id')) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot delete product images - some images are missing identifiers",
          suggestion: "The product has been deleted from the database, but some images may still exist in Cloudinary"
        },
        { status: 400 }
      );
    }

    // Handle CastError (invalid product ID)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error deleting product",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}