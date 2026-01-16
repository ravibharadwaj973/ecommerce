// app/api/sales/trends/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
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
    const period = searchParams.get("period") || "month"; // week, month, year
    const type = searchParams.get("type") || "revenue"; // revenue, orders, customers

    let groupFormat, startDate = new Date();

    switch (period) {
      case "week":
        groupFormat = "%Y-%m-%d";
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        groupFormat = "%Y-%m-%d";
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        groupFormat = "%Y-%m";
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        groupFormat = "%Y-%m-%d";
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const matchStage = {
      paymentStatus: "paid",
      status: { $ne: "cancelled" },
      createdAt: { $gte: startDate }
    };

    let groupField;
    switch (type) {
      case "revenue":
        groupField = { total: { $sum: "$totalAmount" } };
        break;
      case "orders":
        groupField = { total: { $sum: 1 } };
        break;
      case "customers":
        // For unique customers per period
        groupField = { total: { $addToSet: "$user" } };
        break;
      default:
        groupField = { total: { $sum: "$totalAmount" } };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" }
          },
          ...groupField
        }
      },
      { $sort: { _id: 1 } }
    ];

    // For customers count, we need an additional project stage
    if (type === "customers") {
      pipeline.push({
        $project: {
          _id: 1,
          total: { $size: "$total" }
        }
      });
    }

    const trends = await Order.aggregate(pipeline);

    // Compare with previous period for growth
    const previousStartDate = new Date(startDate);
    const periodDiff = startDate.getTime() - previousStartDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff);

    const previousData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: type === "revenue" ? { $sum: "$totalAmount" } : 
                 type === "orders" ? { $sum: 1 } : 
                 { $addToSet: "$user" }
        }
      }
    ]);

    const currentTotal = trends.reduce((sum, item) => sum + item.total, 0);
    const previousTotal = previousData[0] ? 
      (type === "customers" ? previousData[0].total.length : previousData[0].total) : 0;
    
    const growth = previousTotal > 0 ? 
      ((currentTotal - previousTotal) / previousTotal) * 100 : 100;

    return NextResponse.json({
      success: true,
      data: {
        trends,
        metrics: {
          currentTotal,
          previousTotal,
          growth: Math.round(growth * 100) / 100,
          period,
          type
        }
      }
    });

  } catch (error) {
    console.error("Sales trends error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching sales trends" },
      { status: 500 }
    );
  }
}