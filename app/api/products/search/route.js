// app/api/products/search/route.js
import { NextResponse } from "next/server";
import Product from "../../models/Product";
import Category from "../../models/cartegorymodel";
import { connectDB } from "../../config/db";

// @desc    Search products across multiple fields
// @route   GET /api/products/search
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { success: false, message: "Search query is required" },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    const skip = (page - 1) * limit;

    // Build search query across multiple fields
    const searchFilter = {
      $or: [
        // Name search (case insensitive)
        { name: { $regex: searchQuery, $options: 'i' } },
        
        // Description search (case insensitive)
        { description: { $regex: searchQuery, $options: 'i' } },
        
        // Short description search (case insensitive)
        { shortDescription: { $regex: searchQuery, $options: 'i' } },
        
        // Brand search (case insensitive)
        { brand: { $regex: searchQuery, $options: 'i' } },
        
        // Category name search (via population)
        { 'category.name': { $regex: searchQuery, $options: 'i' } },
        
        // Tags search (array contains)
        { tags: { $in: [new RegExp(searchQuery, 'i')] } },
        
        // Features search (array contains)
        { features: { $in: [new RegExp(searchQuery, 'i')] } },
        
        // Colors search (array contains)
        { colors: { $in: [new RegExp(searchQuery, 'i')] } },
        
        // Season search
        { season: { $regex: searchQuery, $options: 'i' } },
        
        // SKU search (exact match)
        { sku: { $regex: `^${searchQuery}$`, $options: 'i' } }
      ],
      isPublished: true // Only show published products
    };

    // Get total count for pagination
    const total = await Product.countDocuments(searchFilter);

    // Search products with pagination and population
    const products = await Product.find(searchFilter)
      .populate('category', 'name slug')
      .sort({
        // Boost products that match in name (most relevant)
        isFeatured: -1,
        'rating.average': -1,
        createdAt: -1
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get search suggestions (categories, brands, tags that match)
    const [matchingCategories, matchingBrands, matchingTags] = await Promise.all([
      // Find matching categories
      Category.find({
        name: { $regex: searchQuery, $options: 'i' },
        isActive: true
      }).select('name slug').limit(5).lean(),

      // Find matching brands - fixed: use aggregate instead of distinct with limit
      Product.aggregate([
        { $match: { 
          brand: { $regex: searchQuery, $options: 'i' },
          isPublished: true 
        }},
        { $group: { _id: '$brand' } },
        { $limit: 5 }
      ]),

      // Find matching tags
      Product.aggregate([
        { $match: { 
          tags: { $in: [new RegExp(searchQuery, 'i')] },
          isPublished: true 
        }},
        { $unwind: '$tags' },
        { $match: { tags: { $regex: searchQuery, $options: 'i' } } },
        { $group: { _id: '$tags' } },
        { $limit: 5 }
      ])
    ]);

    const suggestions = {
      categories: matchingCategories,
      brands: matchingBrands.map(brand => brand._id).filter(brand => brand),
      tags: matchingTags.map(tag => tag._id).filter(tag => tag)
    };

    return NextResponse.json({
      success: true,
      data: {
        products,
        suggestions,
        searchQuery,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: `Found ${total} products matching "${searchQuery}"`
    });

  } catch (error) {
    console.error("Search products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error searching products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}