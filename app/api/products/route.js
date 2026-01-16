import { NextResponse } from "next/server";
import Product from "../models/Product";
import Category from "../models/cartegorymodel";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin / Vendor)
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admin/vendor can create products
    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name');
    const description = formData.get('description');
    const shortDescription = formData.get('shortDescription') || '';
    const price = parseFloat(formData.get('price'));
    const comparePrice = formData.get('comparePrice') ? parseFloat(formData.get('comparePrice')) : null;
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice')) : null;
    const categoryId = formData.get('categoryId');
    const subcategory = formData.get('subcategory') || null;
    const brand = formData.get('brand');
    const stock = parseInt(formData.get('stock')) || 0;
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold')) || 10;
    const season = formData.get('season') || 'all-season';
    const isPublished = formData.get('isPublished') === 'true';
    const isOnSale = formData.get('isOnSale') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isLimitedEdition = formData.get('isLimitedEdition') === 'true';
    const isBackorder = formData.get('isBackorder') === 'true';
    const saleStartDate = formData.get('saleStartDate');
    const saleEndDate = formData.get('saleEndDate');
    const estimatedRestockDate = formData.get('estimatedRestockDate') || null;
    
    // Extract arrays
    const sizes = formData.get('sizes') ? JSON.parse(formData.get('sizes')) : [];
    const colors = formData.get('colors') ? JSON.parse(formData.get('colors')) : [];
    const features = formData.get('features') ? JSON.parse(formData.get('features')) : [];
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : [];

    // Basic validation
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name, price, and categoryId are required" },
        { status: 400 }
      );
    }

    // Check category
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Validate sale logic
    if (isOnSale) {
      if (salePrice >= price) {
        return NextResponse.json(
          { success: false, message: "Sale price must be less than regular price" },
          { status: 400 }
        );
      }

      if (
        saleStartDate &&
        saleEndDate &&
        new Date(saleStartDate) >= new Date(saleEndDate)
      ) {
        return NextResponse.json(
          { success: false, message: "Sale end date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Upload images to Cloudinary
    const imageFiles = formData.getAll('images');
    const uploadedImages = [];

    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile instanceof File && imageFile.size > 0) {
          try {
            // Convert File to buffer
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Upload to Cloudinary
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
              isPrimary: uploadedImages.length === 0, // First image is primary
              altText: name
            });
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            // Continue with other images if one fails
          }
        }
      }
    }

    // Generate SKU
    const lastProduct = await Product.findOne().sort({ createdAt: -1 });
    let nextSku = "PROD001";
    if (lastProduct?.sku) {
      const num = parseInt(lastProduct.sku.replace(/\D/g, ""), 10) + 1;
      nextSku = `PROD${String(num).padStart(3, "0")}`;
    }

    // Calculate discount %
    const discountPercent =
      isOnSale && salePrice && price > 0
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    // Create product
    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      comparePrice,
      salePrice: isOnSale ? salePrice : null,
      category: categoryId,
      subcategory,
      brand,
      stock,
      lowStockThreshold,
      season,
      isLimitedEdition,
      isBackorder,
      estimatedRestockDate: isBackorder ? estimatedRestockDate : null,
      sizes,
      colors,
      features,
      tags,
      sku: nextSku,
      images: uploadedImages,
      isPublished,
      isOnSale,
      isFeatured,
      saleStartDate: isOnSale ? saleStartDate : null,
      saleEndDate: isOnSale ? saleEndDate : null,
      discountPercent,
      createdBy: user.id,
    });

    // Push product into category.products
    await Category.findByIdAndUpdate(categoryId, {
      $push: { products: product._id },
    });

    // Populate the created product for response
    await product.populate('category', 'name');

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: { product },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Get all products (with filters & pagination)
// @route   GET /api/products
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // 🔍 Filter parameters
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = parseFloat(searchParams.get("minPrice"));
    const maxPrice = parseFloat(searchParams.get("maxPrice"));
    const priceRange = searchParams.get("priceRange");
    const inStock = searchParams.get("inStock");
    const isPublished = searchParams.get("isPublished");
    const isFeatured = searchParams.get("isFeatured");
    const isOnSale = searchParams.get("isOnSale");
    const isLimitedEdition = searchParams.get("isLimitedEdition");
    const isLowStock = searchParams.get("isLowStock");
    const season = searchParams.get("season");
    const color = searchParams.get("color");
    const tag = searchParams.get("tag");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const hasImages = searchParams.get("hasImages");

    // 🧩 MongoDB filter object
    const filter = {};

    // Search by name or description (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } }
      ];
    }

    // Category-based filter
    if (category) {
      filter.category = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    // Price range filter
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    // Price range filter (NEW)
    if (priceRange) {
      switch (priceRange) {
        case 'under-50':
          filter.price = { ...filter.price, $lt: 50 };
          break;
        case '50-100':
          filter.price = { ...filter.price, $gte: 50, $lte: 100 };
          break;
        case '100-200':
          filter.price = { ...filter.price, $gte: 100, $lte: 200 };
          break;
        case '200-500':
          filter.price = { ...filter.price, $gte: 200, $lte: 500 };
          break;
        case '500-plus':
          filter.price = { ...filter.price, $gt: 500 };
          break;
      }
    }

    // Stock filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    } else if (inStock === "false") {
      filter.stock = { $lte: 0 };
    }

    // Published filter
    if (isPublished === "true" || isPublished === "false") {
      filter.isPublished = isPublished === "true";
    }

    // Featured filter
    if (isFeatured === "true" || isFeatured === "false") {
      filter.isFeatured = isFeatured === "true";
    }

    // On Sale filter
    if (isOnSale === "true" || isOnSale === "false") {
      filter.isOnSale = isOnSale === "true";
    }

    // Limited edition filter (NEW)
    if (isLimitedEdition === "true" || isLimitedEdition === "false") {
      filter.isLimitedEdition = isLimitedEdition === "true";
    }

    // Low stock filter (NEW)
    if (isLowStock === "true") {
      filter.$expr = {
        $and: [
          { $gt: ["$stock", 0] },
          { $lte: ["$stock", "$lowStockThreshold"] }
        ]
      };
    }

    // Season filter (NEW)
    if (season) {
      filter.season = season;
    }

    // Color filter (checks array)
    if (color) {
      filter.colors = { $in: [new RegExp(color, "i")] };
    }

    // Tag filter (checks array)
    if (tag) {
      filter.tags = { $in: [new RegExp(tag, "i")] };
    }

    // Has images filter
    if (hasImages === "true") {
      filter["images.0"] = { $exists: true };
    }

    const skip = (page - 1) * limit;

    // 🧮 Count total documents
    const total = await Product.countDocuments(filter);

    // Build sort object
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['rating.average'] = sortOrder;
    } else if (sortBy === 'price') {
      sortOptions['price'] = sortOrder;
    } else if (sortBy === 'name') {
      sortOptions['name'] = sortOrder;
    } else if (sortBy === 'trending') {
      sortOptions['trendingScore'] = sortOrder;
    } else if (sortBy === 'sales') {
      sortOptions['salesCount'] = sortOrder;
    } else if (sortBy === 'newest') {
      sortOptions['createdAt'] = sortOrder;
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    // 🧾 Fetch filtered products
    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      data: { products },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
