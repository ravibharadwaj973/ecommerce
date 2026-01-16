import { NextResponse } from 'next/server';
import Review from '../../models/Review';
import User from '../../models/users';
import { connectDB } from '../../config/db';
import { authOptions } from '../../auth/[...nextauth]';
 
import Product from '../../models/Product';
 
import { getServerSession } from 'next-auth';


// @desc    Get current user's reviews
// @route   GET /api/users/reviews
// @access  Private
export async function GET(request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const isApproved = searchParams.get('isApproved');

    const whereClause = { userId: session.user.id };
    
    if (isApproved !== null) {
      whereClause.isApproved = isApproved === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'images', 'price'],
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: { reviews },
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching user reviews',
        error: error.message,
      },
      { status: 500 }
    );
  }
}