import { NextResponse } from "next/server";
import AttributeValue from "../../../models/AttributeValue";
import { connectDB } from "../../../config/db"; 
import slugify from "slugify"
import Attribute from "../../../models/Attribute";
import { FilterQuery } from "mongoose";
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const attributeId = searchParams.get("attribute");

    // Build filter query
   const filter = {};

if (attributeId) {
  filter.attribute = attributeId;
}

    const values = await AttributeValue.find(filter)
      .populate("attribute", "_id name slug") // attach attribute details
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: values,
    });

  } catch (error) {
    console.error("Fetch attribute values error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch attribute values" },
      { status: 500 }
    );
  }
}
