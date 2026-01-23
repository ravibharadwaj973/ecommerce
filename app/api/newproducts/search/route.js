import { NextResponse } from "next/server";
import Product from "../../models/newproduct";
import ProductVariant from "../../models/ProductVariant";
import AttributeValue from "../../models/AttributeValue";
import Category from "../../models/cartegorymodel";
import { connectDB } from "../../config/db";
import { getPagination } from "../../utils/pagination";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q");              // global search text
    const categoryParam = searchParams.get("category");
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 12;

    const { skip, pageNumber, pageSize } = getPagination(page, limit);

    // ---------------- PARSE QUERY TEXT ----------------
    let tokens = [];
    if (q) {
      tokens = q.toLowerCase().split(/\s+/); // ["blue", "tshirt"]
    }
console.log(tokens)
    // ---------------- RESOLVE CATEGORY ----------------
    let categoryIds = [];

    if (categoryParam) {
      categoryIds = [categoryParam];
    } else if (tokens.length) {
      const matchedCategories = await Category.find({
        slug: { $in: tokens },
        isActive: true,
      });

      categoryIds = matchedCategories.map(c => c._id);
    }

    // ---------------- RESOLVE ATTRIBUTE VALUES ----------------
    const attributeValues = await AttributeValue.find({
      slug: { $in: tokens },
      isActive: true,
    });

    const valueIds = attributeValues.map(v => v._id);

    // ---------------- FIND PRODUCTS ----------------
    const productQuery = {};
    if (categoryIds.length) {
      productQuery.category = { $in: categoryIds };
    }

    const products = await Product.find(productQuery);
    const productIds = products.map(p => p._id);
    

    // ---------------- FIND VARIANTS ----------------
    const variantQuery = {
      product: { $in: productIds },
    };

    if (valueIds.length) {
      variantQuery["attributes.value"] = { $all: valueIds };
    }

    const [variants, total] = await Promise.all([
      ProductVariant.find(variantQuery)
        .skip(skip)
        .limit(pageSize)
        .populate("product"),

      ProductVariant.countDocuments(variantQuery),
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
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
