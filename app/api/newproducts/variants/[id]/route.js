import { NextResponse } from "next/server";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";
import ProductVariant from "../../../models/ProductVariant";
import Attribute from "../../../models/Attribute";
import AttributeValue from "../../../models/AttributeValue";

export async function PATCH(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const variantId = id;
    const body = await request.json();

    const { price, stock, isActive, attributes } = body;

    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Variant not found" },
        { status: 404 },
      );
    }

    // -------- OPTIONAL ATTRIBUTE VALIDATION --------
    if (attributes) {
      if (!Array.isArray(attributes) || attributes.length === 0) {
        return NextResponse.json(
          { success: false, message: "Attributes must be an array" },
          { status: 400 },
        );
      }
      for (const item of attributes) {
        console.log(item.attribute);
        const attr = await Attribute.findById(item.attribute);
        if (!attr) {
          return NextResponse.json(
            { success: false, message: "Invalid attribute" },
            { status: 400 },
          );
        }

        const value = await AttributeValue.findById(item.value);
        if (!value) {
          return NextResponse.json(
            { success: false, message: "Invalid 3 attribute value" },
            { status: 400 },
          );
        }

        if (String(value.attribute) !== String(attr._id)) {
          return NextResponse.json(
            {
              success: false,
              message: `Value does not belong to attribute ${attr.name}`,
            },
            { status: 400 },
          );
        }
      }

      variant.attributes = attributes;
    }

    // -------- BASIC FIELDS --------
    if (price != null) variant.price = price;
    if (stock != null) variant.stock = stock;
    if (isActive != null) variant.isActive = isActive;

    await variant.save();

    return NextResponse.json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating variant",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
export async function DELETE(request, context) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (!["admin", "vendor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 },
      );
    }
    const { id } = await context.params;
    const variantId = id;

    const variant = await ProductVariant.findById(variantId);

    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Variant not found" },
        { status: 404 },
      );
    }

    await ProductVariant.deleteOne({ _id: variantId });

    return NextResponse.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting variant",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
