import { NextResponse } from "next/server";
import AttributeValue from "../../models/AttributeValue";
import { connectDB } from "../../config/db";
import Attribute from "../../models/Attribute";
import slugify from "slugify"

export async function POST(request) {
  try {
    await connectDB();

    const { attribute, value, isActive = true } = await request.json();

    // ---------------- VALIDATION ----------------
    if (!attribute || !value || !value.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "attribute and value are required",
        },
        { status: 400 }
      );
    }

    // ---------------- VALIDATE ATTRIBUTE ----------------
    const attrExists = await Attribute.findById(attribute);
    if (!attrExists) {
      return NextResponse.json(
        { success: false, message: "Invalid attribute" },
        { status: 400 }
      );
    }

    // ---------------- GENERATE SLUG ----------------
    const slug = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });

    // ---------------- DUPLICATE CHECK ----------------
    const exists = await AttributeValue.findOne({
      attribute,
      $or: [{ value }, { slug }],
    });

    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Attribute value already exists",
        },
        { status: 409 }
      )
    }

    // ---------------- CREATE VALUE ----------------
    const attributeValue = await AttributeValue.create({
      attribute,
      value,
      slug,
      isActive,
    });

    return NextResponse.json(
      { success: true, data: attributeValue },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create attribute value error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const attributeValues = await AttributeValue.find({ isActive: true })
      .populate("attribute", "name slug")
      .sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      data: attributeValues,
    });
  } catch (error) {
    console.error("Get attribute values error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching attribute values",
        error: error.message,
      },
      { status: 500 }
    );
  }
}