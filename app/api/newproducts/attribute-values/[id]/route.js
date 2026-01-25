import { NextResponse } from "next/server";
import AttributeValue from "../../../models/AttributeValue";
import { connectDB } from "../../../config/db"; 
import slugify from "slugify"
export async function PUT(request, context) {
  try {
    await connectDB();

    const { id } =await context.params;
    const { value, isActive } = await request.json();

    // -------- VALIDATION --------
    if (!value || !value.trim()) {
      return NextResponse.json(
        { success: false, message: "Value is required" },
        { status: 400 }
      );
    }

    // -------- FIND EXISTING --------
    const existing = await AttributeValue.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Attribute value not found" },
        { status: 404 }
      );
    }

    // -------- GENERATE NEW SLUG --------
    const slug = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });

    // -------- DUPLICATE CHECK --------
    const duplicate = await AttributeValue.findOne({
      _id: { $ne: id },
      attribute: existing.attribute,
      $or: [{ value }, { slug }],
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Value already exists" },
        { status: 409 }
      );
    }

    // -------- UPDATE --------
    existing.value = value;
    existing.slug = slug;
    if (typeof isActive === "boolean") {
      existing.isActive = isActive;
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      data: existing,
      message: "Value updated successfully",
    });

  } catch (error) {
    console.error("Update attribute value error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
export async function DELETE(request, context) {
  try {
    await connectDB();

    const { id } =await context.params;

    const deleted = await AttributeValue.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Attribute value not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attribute value deleted successfully",
    });

  } catch (error) {
    console.error("Delete attribute value error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
