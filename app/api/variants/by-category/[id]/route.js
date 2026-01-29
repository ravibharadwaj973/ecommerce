// Path: app/api/variants/by-category/[categoryId]/route.js
import { NextResponse } from "next/server";

import newProduct from "../../../models/newproduct";
import Category from "../../../models/cartegorymodel";
import { connectDB } from "../../../config/db";
import ProductVariant from "../../../models/ProductVariant";

async function getChildIds(parentId) {
  // Ensure we are working with a string, not an object
  const cleanParentId =
    typeof parentId === "object" ? parentId.id || parentId._id : parentId;

  let allIds = [cleanParentId];

  // Find only the IDs of children
  const children = await Category.find({ parentCategory: parentId })
    .select("_id")
    .lean();
  //   console.log(children)
  for (const child of children) {
    // child._id is a MongoDB ObjectId, convert to string for the next recursive call
    const nestedIds = await getChildIds(child._id.toString());
    allIds = [...allIds, ...nestedIds];
  }

  return allIds;
}
export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const targetIds = await getChildIds(id);

    const products = await newProduct
      .find({
        category: { $in: targetIds },
        isActive: true,
      })
      .populate("category", "name")
      .populate("variants")
      // Change "ProductVariant" to "variants" (the name of the virtual)

      .sort({ createdAt: -1 })
      .lean({ virtuals: true }); // Crucial for virtuals to show up with lean()

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
