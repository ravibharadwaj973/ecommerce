import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import { requireAuth } from "../../auth/auth";

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day | week | month | year

    // ---------------- DATE RANGE ----------------
    const startDate = new Date();
    switch (period) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // ---------------- TOTAL ORDERS ----------------
    const totalOrders = await Order.countDocuments();

    // ---------------- RECENT ORDERS ----------------
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
    });

    // ---------------- TOTAL REVENUE ----------------
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          "payment.status": "paid",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // ---------------- ORDERS BY STATUS ----------------
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // ---------------- SALES OVER TIME ----------------
    const recentSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "payment.status": "paid",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          dailyRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          dailyRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    // ---------------- RESPONSE ----------------
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          recentOrders,
          totalRevenue,
          ordersByStatus,
          recentSales,
        },
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching order statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
