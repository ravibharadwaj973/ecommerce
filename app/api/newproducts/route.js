import { NextResponse } from "next/server";
import newProduct from "../models/newproduct";

import { connectDB } from "../config/db";
import { requireAuth } from "../auth/auth";
import slugify from "slugify";
// Cloudinary config
import cloudinary from "../_lib/cloudnary";

import Category from "../models/cartegorymodel";
import ProductVariant from "../models/ProductVariant";
// @route   POST /api/products
// @access  Admin / Vendor
export async function POST(request) {
  try {
    await connectDB();

    // ---------- AUTH ----------
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    // ---------- BASIC FIELDS ----------
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString() || "";
    const categoryId = formData.get("categoryId");
    const brand = formData.get("brand")?.toString() || "";
    const isPublished = formData.get("isPublished") === "true";

    const features = formData.get("features")
      ? JSON.parse(formData.get("features"))
      : [];

    const tags = formData.get("tags") ? JSON.parse(formData.get("tags")) : [];

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and category are required" },
        { status: 400 },
      );
    }

    // ---------- VALIDATE CATEGORY ----------
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 },
      );
    }

    // ---------- IMAGE UPLOAD ----------
    const imageFiles = formData.getAll("images");
    const uploadedImages = [];

    for (const imageFile of imageFiles) {
      if (imageFile instanceof File && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "ecommerce/products",
                transformation: [
                  { width: 1200, height: 1200, crop: "limit" },
                  { quality: "auto" },
                  { format: "webp" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              },
            )
            .end(buffer);
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: uploadedImages.length === 0,
          altText: name,
        });
      }
    }

    // ---------- CREATE PRODUCT ----------
    const product = await newProduct.create({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      category: categoryId,
      brand,
      images: uploadedImages,
      features,
      tags,
      isPublished,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
export async function GET(request) {
  try {
    await connectDB();

    // Fetch all products
    const products = await newProduct.find().lean();

    // Fetch all category IDs used
    const categoryIds = products
      .map(p => p.category)
      .filter(Boolean);

    const categories = await Category.find({
      _id: { $in: categoryIds },
    })
      .select("name slug image parentCategory")
      .lean();
    // Create lookup map
    const categoryMap = {};
    categories.forEach(cat => {
      
      categoryMap[String(cat._id)] = cat;
    });

    // Attach variants + category manually
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({
          product: product._id,
        })
          .select("_id sku price stock attributes isActive createdAt")
          .lean();

        return {
          ...product,
 
          // Attach category safely
          category: product.category
            ? categoryMap[String(product.category)] || null
            : null,

          variantCount: variants.length,
          variantIds: variants.map(v => v._id),
          variantsPreview: variants.slice(0, 3),
        };
      }),
    );

    return NextResponse.json({
      success: true,
      count: productsWithVariants.length,
      data: productsWithVariants,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
