import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import ProductVariant from "../../models/ProductVariant";
import newProducts from "../../models/newproduct";
import Attribute from "../../models/Attribute"
import AttributeValue from "../../models/AttributeValue"
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const product = searchParams.get("product");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const isActive = searchParams.get("isActive");

    const filter = {};

    if (product) {
      filter.product = product;
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const [variants, total] = await Promise.all([
      ProductVariant.find(filter)
        .populate("product", "name")
        .populate("attributes.attribute", "name")
        .populate("attributes.value", "value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ProductVariant.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: variants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Get variants error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching variants",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
