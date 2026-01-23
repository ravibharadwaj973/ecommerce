import { NextResponse } from "next/server";
import Category from "../../models/cartegorymodel";
import newProduct from "../../models/newproduct";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// -------------------------------------------
// GET SINGLE CATEGORY (PUBLIC)
// -------------------------------------------
export async function GET(request, context) {
  try {
    await connectDB();

    const { id: CategoryId } = await context.params;

    const url = new URL(request.url);
    const includeProducts = url.searchParams.get("includeProducts") === "true";

    let category;

    if (includeProducts) {
      category = await Category.findById(CategoryId)
        .populate({
          path: "products",
          select: 'name price images description stock isPublished createdAt',
          options: { 
            sort: { createdAt: -1 },
            // You can also add pagination here if needed
            // limit: 20,
            // skip: 0
          }
        })
        .lean();
    } else {
      category = await Category.findById(CategoryId).lean();
      
      // Get product count separately if not populating
      const productCount = await newProduct.countDocuments({ 
        category: CategoryId,
        isPublished: true 
      });
      category.productCount = productCount;
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}



// -------------------------------------------
// UPDATE CATEGORY (ADMIN ONLY)
// -------------------------------------------
export async function PUT(request, context) {
  try {
    await connectDB();
const {id}=await context.params;
    const user = await requireAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { name, description, image, isActive } = await request.json();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check duplicate name
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({ name: name.trim() });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Category with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update values
    category.name = name?.trim() ?? category.name;
    category.description = description?.trim() ?? category.description;
    category.image = image ?? category.image;
    category.isActive = isActive ?? category.isActive;

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// -------------------------------------------
// DELETE CATEGORY (ADMIN ONLY)
// -------------------------------------------
export async function DELETE(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }
const {id}=await context.params;
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check product count
    const productCount = await newProduct.countDocuments({
      categoryId: id,
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category. It has ${productCount} product(s). Reassign or delete products first.`,
        },
        { status: 400 }
      );
    }

    await Category.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
