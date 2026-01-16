// app/api/sales/customers/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import Order from "../../models/order";

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
    const days = parseInt(searchParams.get("days")) || 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Customer acquisition trends
    const acquisitionTrends = await User.aggregate([
      {
        $match: {
          role: "customer",
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer lifetime value analysis
    const customerLTV = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $project: {
          customerId: "$_id",
          name: "$customer.name",
          email: "$customer.email",
          totalSpent: 1,
          orderCount: 1,
          averageOrderValue: { $divide: ["$totalSpent", "$orderCount"] },
          customerSince: "$firstOrder"
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 50 }
    ]);

    // Repeat customer rate
    const customerStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          repeatCustomers: {
            $sum: {
              $cond: [{ $gt: ["$orderCount", 1] }, 1, 0]
            }
          },
          totalOrders: { $sum: "$orderCount" }
        }
      }
    ]);

    const stats = customerStats[0] || {
      totalCustomers: 0,
      repeatCustomers: 0,
      totalOrders: 0
    };

    const repeatCustomerRate = stats.totalCustomers > 0 ? 
      (stats.repeatCustomers / stats.totalCustomers) * 100 : 0;

    // New vs Returning customers
    const newVsReturning = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$user",
          firstOrderDate: { $min: "$createdAt" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          customerType: {
            $cond: {
              if: { $gt: ["$orderCount", 1] },
              then: "returning",
              else: "new"
            }
          }
        }
      },
      {
        $group: {
          _id: "$customerType",
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        acquisitionTrends,
        customerLTV,
        metrics: {
          totalCustomers: stats.totalCustomers,
          repeatCustomers: stats.repeatCustomers,
          repeatCustomerRate: Math.round(repeatCustomerRate * 100) / 100,
          averageOrdersPerCustomer: stats.totalCustomers > 0 ? 
            Math.round((stats.totalOrders / stats.totalCustomers) * 100) / 100 : 0
        },
        newVsReturning,
        period: days
      }
    });

  } catch (error) {
    console.error("Customer analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching customer analytics" },
      { status: 500 }
    );
  }
}