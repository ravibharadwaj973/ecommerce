import { NextResponse } from 'next/server';
import Product from '@/models/Product';
import { connectDB } from '@/config/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// @desc    Update product stock
// @route   PATCH /api/products/[id]/stock
// @access  Private/Admin/Vendor
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'vendor')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      );
    }

    const { stock, operation = 'set' } = await request.json();

    const product = await Product.findByPk(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    let newStock = product.stock;

    switch (operation) {
      case 'increment':
        newStock += parseInt(stock);
        break;
      case 'decrement':
        newStock = Math.max(0, product.stock - parseInt(stock));
        break;
      case 'set':
      default:
        newStock = parseInt(stock);
        break;
    }

    await product.update({ stock: newStock });

    return NextResponse.json({
      success: true,
      message: 'Product stock updated successfully',
      data: { 
        product: { 
          id: product.id, 
          name: product.name, 
          stock: newStock 
        } 
      },
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating product stock',
        error: error.message,
      },
      { status: 500 }
    );
  }
}