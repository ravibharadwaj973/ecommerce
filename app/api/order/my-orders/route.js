import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";
import Order from "../../models/order";

export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // ---------------- FILTER ----------------
    const query = { user: user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    // ---------------- FETCH ORDERS ----------------
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.variant",
          populate: { path: "product" }
        })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching your orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
