import { NextResponse } from 'next/server';
import Category from '../../../models/cartegorymodel';
import { connectDB } from '../../../config/db';
import { Op } from 'sequelize';


// @desc    Search categories
// @route   GET /api/categories/search/[query]
// @access  Public
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const onlyActive = searchParams.get('onlyActive') !== 'false';

    const { query } = params;

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Search query is required' },
        { status: 400 }
      );
    }

    const whereClause = {
      name: { [Op.iLike]: `%${query.trim()}%` }
    };

    if (onlyActive) {
      whereClause.isActive = true;
    }

    const categories = await Category.findAll({
      where: whereClause,
      limit,
      order: [['name', 'ASC']]
    });

    return NextResponse.json({
      success: true,
      data: { categories },
      count: categories.length,
    });
  } catch (error) {
    console.error('Search categories error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error searching categories',
        error: error.message,
      },
      { status: 500 }
    );
  }
}