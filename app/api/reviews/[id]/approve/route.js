import { NextResponse } from 'next/server';
import Review from '@/models/Review';
import { connectDB } from '@/config/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// @desc    Approve/reject review
// @route   PATCH /api/reviews/[id]/approve
// @access  Private/Admin
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const { isApproved } = await request.json();

    const review = await Review.findByPk(params.id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    await review.update({ isApproved });

    // Update product rating
    await updateProductRating(review.productId);

    const message = isApproved ? 'Review approved successfully' : 'Review rejected successfully';

    return NextResponse.json({
      success: true,
      message,
      data: { review },
    });
  } catch (error) {
    console.error('Approve review error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating review status',
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