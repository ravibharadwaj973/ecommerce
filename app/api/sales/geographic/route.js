// app/api/sales/geographic/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import Product from "../../models/Product";
import { requireAuth } from "../../auth/auth";

export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days")) || 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Sales by country/region
    const salesByRegion = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
          "shippingAddress.country": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$shippingAddress.country",
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
          customers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          country: "$_id",
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: { $round: ["$averageOrderValue", 2] },
          customerCount: { $size: "$customers" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Sales by city (top cities)
    const salesByCity = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
          "shippingAddress.city": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: {
            country: "$shippingAddress.country",
            city: "$shippingAddress.city"
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          country: "$_id.country",
          city: "$_id.city",
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 }
    ]);

    // Geographic growth trends
    const geographicTrends = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
          "shippingAddress.country": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: {
            country: "$shippingAddress.country",
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
          },
          monthlyRevenue: { $sum: "$totalAmount" },
          monthlyOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1, "_id.country": 1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        salesByRegion,
        salesByCity,
        geographicTrends,
        period: days
      }
    });

  } catch (error) {
    console.error("Geographic sales error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching geographic sales data" },
      { status: 500 }
    );
  }
}