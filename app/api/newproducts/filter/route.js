import { NextResponse } from "next/server";
import Attribute from "../../models/Attribute";
import AttributeValue from "../../models/AttributeValue";
import { connectDB } from "../../config/db";

export async function GET() {
  try {
    await connectDB();

    const attributes = await Attribute.find({ isActive: true });
    const values = await AttributeValue.find({ isActive: true });

    const filters = {};

    attributes.forEach(attr => {
      filters[attr.name] = values
        .filter(v => String(v.attribute) === String(attr._id))
        .map(v => ({ id: v._id, value: v.value, slug: v.slug }));
    });

    return NextResponse.json({ success: true, data: filters });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
