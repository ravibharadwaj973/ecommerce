// app/api/categories/route.js
import { NextResponse } from "next/server";
import Category from "../models/cartegorymodel";
import newProduct from "../models/newproduct";
import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";
import slugify from "slugify";
import cloudinary from "../_lib/cloudnary";
// ---------------------------------------------------------
// @desc    Create Category (Admin Only)
// @route   POST /api/categories
// @access  Private/Admin
// ---------------------------------------------------------
export async function POST(request) {
  try {
    await connectDB();

    // ---------- AUTH ----------
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // ---------- BASIC FIELDS ----------
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString() || "";
    const parentCategory = formData.get("parentCategory") || null;
    const isActive = formData.get("isActive") !== "false";

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    // ---------- DUPLICATE CHECK ----------
    const existing = await Category.findOne({ slug, parentCategory });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists at this level",
        },
        { status: 400 }
      );
    }

    // ---------- IMAGE UPLOAD ----------
    let image = null;
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "ecommerce/categories",
              transformation: [
                { width: 800, height: 800, crop: "limit" },
                { quality: "auto" },
                { format: "webp" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // ---------- CREATE CATEGORY ----------
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
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
    const parent = searchParams.get("parent"); // ✅ NEW
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;

    const query = {};

    // ✅ ACTIVE FILTER
    if (onlyActive) query.isActive = true;

    // ✅ PARENT FILTER
    if (parent) {
      query.parentCategory = parent;
    } else {
      // top-level categories (Men, Women)
      query.parentCategory = null;
    }

    const skip = (page - 1) * limit;

const r=query.parentCategory;
    // Fetch categories
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Category.countDocuments(query);

    // ---------------- INCLUDE PRODUCTS ----------------
    if (includeProducts) {
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await newProduct.find({
            category: r, // ✅ FIXED FIELD
            ...(onlyActive && { isPublished: true }),
          }).select("name images isActive");

          return { ...category, products };
        })
      );

      return NextResponse.json({
        success: true,
        data: categoriesWithProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // ---------------- PRODUCT COUNT ONLY ----------------
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await newProduct.countDocuments({
          category: category._id, // ✅ FIXED FIELD
          ...(onlyActive && { isPublished: true }),
        });

        return { ...category, productCount };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

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
