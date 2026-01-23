import { NextResponse } from "next/server";
import Category from "../models/Category";
import { connectDB } from "../config/db";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true }).lean();

    const map = {};
    categories.forEach(cat => {
      map[cat._id] = { ...cat, children: [] };
    });

    const tree = [];
    categories.forEach(cat => {
      if (cat.parentCategory) {
        map[cat.parentCategory]?.children.push(map[cat._id]);
      } else {
        tree.push(map[cat._id]);
      }
    });

    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
