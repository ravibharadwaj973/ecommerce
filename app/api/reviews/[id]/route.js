import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import User from '@/models/User';
import Product from '@/models/Product';
import { connectDB } from '@/config/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// @desc    Get review by ID
// @route   GET /api/reviews/[id]
// @access  Public
export async function GET(request, { params }) {
  try {
    await connectDB();

    const review = await Review.findByPk(params.id, {
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
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if review is approved or user is admin
    const session = await getServerSession(authOptions);
    if (!review.isApproved && (!session || session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Review not available' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching review',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Update review
// @route   PUT /api/reviews/[id]
// @access  Private
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { rating, comment } = await request.json();

    const review = await Review.findByPk(params.id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns the review or is admin
    if (review.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this review' },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await review.update({
      rating: rating || review.rating,
      comment: comment !== undefined ? comment : review.comment,
      // Reset approval status if user updates their review
      isApproved: session.user.role === 'admin' ? review.isApproved : false,
    });

    // Update product rating if review is approved
    if (review.isApproved) {
      await updateProductRating(review.productId);
    }

    const updatedReview = await Review.findByPk(params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        }
      ],
    });

    return NextResponse.json({
      success: true,
      message: session.user.role === 'admin' ? 'Review updated successfully' : 'Review updated successfully. It will be visible after approval.',
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating review',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete review
// @route   DELETE /api/reviews/[id]
// @access  Private
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const review = await Review.findByPk(params.id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user owns the review or is admin
    if (review.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this review' },
        { status: 403 }
      );
    }

    const productId = review.productId;
    await review.destroy();

    // Update product rating
    await updateProductRating(productId);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting review',
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
    } else {
      // Reset rating if no approved reviews
      await Product.update(
        {
          rating: {
            average: 0,
            count: 0
          }
        },
        { where: { id: productId } }
      );
    }
  } catch (error) {
    console.error('Update product rating error:', error);
  }
}