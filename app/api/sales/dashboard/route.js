// app/api/sales/dashboard/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";
import Product from "../../models/Product";
import User from "../../models/users";
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
    const days = parseInt(searchParams.get("days")) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel data fetching for performance
    const [
      totalRevenueData,
      totalOrdersData,
      totalCustomersData,
      recentOrdersData,
      topProductsData,
      revenueTrendData
    ] = await Promise.all([
      // Total Revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            status: { $ne: "cancelled" },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]),
      
      // Total Orders
      Order.countDocuments({
        paymentStatus: "paid",
        status: { $ne: "cancelled" },
        createdAt: { $gte: startDate }
      }),
      
      // Total Customers
      User.countDocuments({ 
        role: "customer",
        createdAt: { $gte: startDate }
      }),
      
      // Recent Orders for table
      Order.find({
        paymentStatus: "paid",
        status: { $ne: "cancelled" },
        createdAt: { $gte: startDate }
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber totalAmount status createdAt"),
      
      // Top Selling Products
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            status: { $ne: "cancelled" },
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            name: "$product.name",
            totalSold: 1,
            totalRevenue: 1,
            image: "$product.images.0"
          }
        }
      ]),
      
      // Revenue trend for chart
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            status: { $ne: "cancelled" },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;
    const averageOrderValue = totalOrdersData > 0 ? totalRevenue / totalOrdersData : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders: totalOrdersData,
          totalCustomers: totalCustomersData,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100
        },
        recentOrders: recentOrdersData,
        topProducts: topProductsData,
        revenueTrend: revenueTrendData
      }
    });

  } catch (error) {
    console.error("Sales dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching sales data" },
      { status: 500 }
    );
  }
}