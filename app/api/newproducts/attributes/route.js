import { NextResponse } from "next/server";
import Attribute from "../../models/Attribute";
import { connectDB } from "../../config/db";
import slugify from "slugify";


export async function POST(request) {
  try {
    await connectDB();

    const { name, isActive = true } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Attribute name is required" },
        { status: 400 }
      );
    }

    // 🔑 Generate slug from name
    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    // 🔒 Ensure slug uniqueness
    const existing = await Attribute.findOne({
      $or: [{ name }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Attribute already exists" },
        { status: 409 }
      );
    }

    const attribute = await Attribute.create({
      name,
      slug,
      isActive,
    });

    return NextResponse.json(
      { success: true, data: attribute },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create attribute error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const attributes = await Attribute.find({ isActive: true })
      .select("name slug isActive createdAt")
      .sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error("Get attributes error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching attributes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
