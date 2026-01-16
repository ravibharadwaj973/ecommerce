import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Order from "@/models/Order";
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
    const period = searchParams.get("period") || "month"; // day, week, month, year

    // Calculate start date for filtering
    let startDate = new Date();
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
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // ---- 🧮 Aggregate stats ----

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Recent orders (in selected period)
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Total revenue (only paid + not cancelled)
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
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
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Orders by status (for chart or dashboard)
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: { _id: 0, status: "$_id", count: 1 },
      },
    ]);

    // Recent sales by day
    const recentSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
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
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          dailyRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    // ---- ✅ Return result ----
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
