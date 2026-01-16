import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import User from '@/models/User';
import Product from '@/models/Product';
import { connectDB } from '@/config/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export async function POST(request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    // Validate required fields
    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, message: 'Product ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId: session.user.id, productId }
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review (initially not approved)
    const review = await Review.create({
      userId: session.user.id,
      productId,
      rating,
      comment: comment || null,
      isApproved: false, // Requires admin approval
    });

    // Update product rating (you might want to recalculate average)
    await updateProductRating(productId);

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully. It will be visible after approval.',
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating review',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Get all reviews with filtering
// @route   GET /api/reviews
// @access  Public
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const isApproved = searchParams.get('isApproved');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    // Build where clause
    const whereClause = {};
    
    // For public access, only show approved reviews
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      whereClause.isApproved = true;
    }
    
    if (productId) {
      whereClause.productId = productId;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (rating) {
      whereClause.rating = parseInt(rating);
    }
    
    if (isApproved !== null && (session?.user.role === 'admin')) {
      whereClause.isApproved = isApproved === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Product,
          attributes: ['id', 'name', 'images'],
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
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
    console.error('Get all reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching reviews',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.findAll({
      where: { 
        productId, 
        isApproved: true 
      },
      attributes: ['rating']
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      const ratingCount = reviews.length;

      await Product.update(
        {
          rating: {
            average: parseFloat(averageRating.toFixed(1)),
            count: ratingCount
          }
        },
        { where: { id: productId } }
      );
    }
  } catch (error) {
    console.error('Update product rating error:', error);
  }
}