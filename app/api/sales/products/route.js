
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
    const days = parseInt(searchParams.get("days")) || 30;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "revenue";
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const productPerformance = await Order.aggregate([
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
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          averagePrice: { $avg: "$items.price" },
          orderCount: { $addToSet: "$_id" } // Count unique orders containing this product
        }
      },
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
          productId: "$_id",
          name: "$product.name",
          category: "$product.category",
          price: "$product.price",
          stock: "$product.stock",
          images: "$product.images",
          totalSold: 1,
          totalRevenue: 1,
          averagePrice: 1,
          orderCount: { $size: "$orderCount" },
          conversionRate: {
            $cond: {
              if: { $gt: ["$product.views", 0] },
              then: { $divide: ["$totalSold", "$product.views"] },
              else: 0
            }
          }
        }
      },
      { $sort: { [sortBy === "quantity" ? "totalSold" : "totalRevenue"]: -1 } },
      { $limit: limit }
    ]);

    // Category performance
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      { $unwind: "$productData" },
      {
        $group: {
          _id: "$productData.category",
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalSold: { $sum: "$items.quantity" },
          productCount: { $addToSet: "$items.product" }
        }
      },
      {
        $project: {
          category: "$_id",
          totalRevenue: 1,
          totalSold: 1,
          productCount: { $size: "$productCount" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        productPerformance,
        categoryPerformance,
        period: days
      }
    });

  } catch (error) {
    console.error("Product performance error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching product performance" },
      { status: 500 }
    );
  }
}