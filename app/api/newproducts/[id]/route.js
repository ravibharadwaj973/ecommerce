import { NextResponse } from "next/server";
import newProduct from "../../models/newproduct";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import cloudinary from "../../_lib/cloudnary";
import { getPagination } from "../../utils/pagination";
import mongoose from "mongoose";
import Category from "../../models/cartegorymodel"
import slugify from "slugify";
import ProductVariant from "../../models/ProductVariant";
 
export async function GET(request, context) {
  try {
    await connectDB();
const {id}=await context.params;
    const product = await newProduct.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await connectDB();
    const {id}=await context.params;

    const user = await requireAuth(request);
    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const formData = await request.formData();

    const name = formData.get("name")?.trim();
    const description = formData.get("description") || "";
    const categoryId = formData.get("categoryId");
    const brand = formData.get("brand") || "";
    const features = formData.get("features") ? JSON.parse(formData.get("features")) : [];
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags")) : [];
    const isPublished = formData.get("isPublished") === "true";

    const product = await newProduct.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // Validate category if changed
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
      }
      product.category = categoryId;
    }

    // Handle image upload if provided
    const imageFiles = formData.getAll("images");
    if (imageFiles.length > 0 && imageFiles[0] instanceof File) {
      const uploadedImages = [];

      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: "ecommerce/products",
                transformation: [{ width: 1200, height: 1200, crop: "limit" }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });

          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            isPrimary: uploadedImages.length === 0,
            altText: name,
          });
        }
      }

      product.images = uploadedImages;
    }

    // Update fields
    product.name = name ?? product.name;
    product.slug = slugify(product.name, { lower: true });
    product.description = description;
    product.brand = brand;
    product.features = features;
    product.tags = tags;
    product.isPublished = isPublished;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
export async function DELETE(request, context) {
  try {
    await connectDB();

    // ---------- AUTH ----------
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { id } =await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // ---------- FIND PRODUCT ----------
    const product = await newProduct.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // ---------- DELETE CLOUDINARY IMAGES ----------
    if (product.images?.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.warn("Cloudinary delete failed:", err);
          }
        }
      }
    }

    // ---------- DELETE PRODUCT ----------
    await newProduct.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
