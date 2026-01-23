import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Category from "../../models/cartegorymodel";
// GET /api/categories/children
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parent = searchParams.get("parent");

    const query = parent
      ? { parentCategory: parent, isActive: true }
      : { parentCategory: null, isActive: true };

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
