// app/api/categories/route.js
import { NextResponse } from "next/server";
import Category from "../models/cartegorymodel";
import Product from "../models/Product";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";

// ---------------------------------------------------------
// @desc    Create Category (Admin Only)
// @route   POST /api/categories
// @access  Private/Admin
// ---------------------------------------------------------
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Check admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || null;
    const image = body.image || null;
    const isActive = body.isActive ?? true;

    // Validate name
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check duplicate (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      image,
      isActive,
      products: [] // important initialization
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: { category },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


// ---------------------------------------------------------
// @desc    Get Categories (Optionally Include Products)
// @route   GET /api/categories
// @access  Public
// ---------------------------------------------------------
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const onlyActive = searchParams.get("onlyActive") !== "false"; // default true
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;

    const query = {};
    if (onlyActive) query.isActive = true;

    const skip = (page - 1) * limit;

    // Fetch categories with pagination
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Category.countDocuments(query);

    // Include product details or counts
    if (includeProducts) {
      // Fetch products grouped by category
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.find({
            categoryId: category._id,
            ...(onlyActive && { isPublished: true }),
          }).select("name price images stock isPublished");

          return { ...category, products };
        })
      );

      return NextResponse.json({
        success: true,
        data: { categories: categoriesWithProducts },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } else {
      // Add product count to each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            categoryId: category._id,
            ...(onlyActive && { isPublished: true }),
          });
          return { ...category, productCount };
        })
      );

      return NextResponse.json({
        success: true,
        data: { categories: categoriesWithCount },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Get all categories error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching categories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
