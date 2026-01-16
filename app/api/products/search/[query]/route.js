import { NextResponse } from 'next/server';
import Product from '../../../models/Product';
import { connectDB } from '../../../config/db';
import { Op } from 'sequelize';

// @desc    Search products
// @route   GET /api/products/search/[query]
// @access  Public
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${params.query}%` } },
          { description: { [Op.iLike]: `%${params.query}%` } },
          { brand: { [Op.iLike]: `%${params.query}%` } },
          { tags: { [Op.contains]: [params.query] } }
        ],
        isPublished: true,
      },
      limit,
    });

    return NextResponse.json({
      success: true,
      data: { products },
      count: products.length,
    });
  } catch (error) {
    console.error('Search products error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error searching products',
        error: error.message,
      },
      { status: 500 }
    );
  }
}