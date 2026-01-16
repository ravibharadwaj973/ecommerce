import { NextResponse } from 'next/server';
import Category from '../../models/cartegorymodel';
import Product from '../../models/Product';
import { connectDB } from '../../config/db';

// @desc    Get categories with product counts
// @route   GET /api/categories/with-counts
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('onlyActive') !== 'false';

    const whereClause = {};
    if (onlyActive) {
      whereClause.isActive = true;
    }

    const categories = await Category.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'description', 'image', 'isActive'],
      order: [['name', 'ASC']]
    });

    // Add product counts to each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.count({
          where: { 
            categoryId: category.id,
            ...(onlyActive && { isPublished: true })
          }
        });

        return {
          ...category.toJSON(),
          productCount
        };
      })
    );

    // Filter out categories with 0 products if requested
    const filteredCategories = onlyActive 
      ? categoriesWithCounts.filter(cat => cat.productCount > 0)
      : categoriesWithCounts;

    return NextResponse.json({
      success: true,
      data: { categories: filteredCategories },
      count: filteredCategories.length,
    });
  } catch (error) {
    console.error('Get categories with counts error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching categories with counts',
        error: error.message,
      },
      { status: 500 }
    );
  }
}