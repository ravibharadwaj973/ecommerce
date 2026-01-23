import { NextResponse } from "next/server";

import { connectDB } from "../../config/db";
import { getPagination } from "../../utils/pagination";
import newProduct from "../../models/newproduct";
import ProductVariant from "../../models/ProductVariant";
import Attribute from "../../models/Attribute";
import AttributeValue from "../../models/AttributeValue";
import { requireAuth } from "../../auth/auth";

export async function POST(request) {
  try {
    await connectDB();

    // Auth
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Admin / Vendor only
    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      product,
      sku,
      price,
      stock,
      attributes,
      isActive = true,
    } = body;

    // ---------------- VALIDATIONS ----------------

    if (!product || !sku || price == null || stock == null) {
      return NextResponse.json(
        {
          success: false,
          message: "product, sku, price, and stock are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(attributes) || attributes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one attribute is required",
        },
        { status: 400 }
      );
    }
console.log(product)
    // Check product exists
    const productExists = await newProduct.findById(product);
    if (!productExists) {
      return NextResponse.json(
        { success: false, message: "Invalid product" },
        { status: 400 }
      );
    }

    // SKU must be unique
    const existingSku = await ProductVariant.findOne({ sku });
    if (existingSku) {
      return NextResponse.json(
        { success: false, message: "SKU already exists" },
        { status: 400 }
      );
    }

    // Validate attributes & values
    for (const item of attributes) {
      if (!item.attribute || !item.value) {
        return NextResponse.json(
          {
            success: false,
            message: "Each attribute must have attribute and value",
          },
          { status: 400 }
        );
      }

      const attr = await Attribute.findById(item.attribute);
      if (!attr) {
        return NextResponse.json(
          { success: false, message: "Invalid attribute" },
          { status: 400 }
        );
      }

      const attrValue = await AttributeValue.findById(item.value);
      if (!attrValue) {
        return NextResponse.json(
          { success: false, message: "Invalid attribute value" },
          { status: 400 }
        );
      }
   const existingVariants = await ProductVariant.findOne({ product });
    if (existingVariants) {
      return NextResponse.json(
        {
          success: false,
          message: "Variants already exist for this product",
        },
        { status: 400 }
      );
    }
      // Ensure value belongs to attribute
      if (String(attrValue.attribute) !== String(attr._id)) {
        return NextResponse.json(
          {
            success: false,
            message: `Attribute value does not belong to attribute ${attr.name}`,
          },
          { status: 400 }
        );
      }
    }

    // ---------------- CREATE VARIANT ----------------

    const variant = await ProductVariant.create({
      product,
      sku,
      price,
      stock,
      attributes,
      isActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Variant created successfully",
        data: variant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create variant error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating variant",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const product = searchParams.get("product");
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    const { skip, pageNumber, pageSize } = getPagination(page, limit);

    const [variants, total] = await Promise.all([
      ProductVariant.find({ product, isActive: true })
        .skip(skip)
        .limit(pageSize)
        .populate("attributes.attribute")
        .populate("attributes.value"),

      ProductVariant.countDocuments({ product, isActive: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: variants,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
