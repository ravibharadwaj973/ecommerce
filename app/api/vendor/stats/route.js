// app/api/vendors/stats/route.js
import { NextResponse } from "next/server";
import Vendor from "../../models/Vendor";
import User from "../../models/users";
import Product from "../../models/Product";
import Order from "../../models/order";
import { connectDB } from "../../config/db";
import { requireAuth } from "../../auth/auth";

// @desc    Get vendor statistics (Admin only)
// @route   GET /api/vendors/stats
// @access  Private/Admin
export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can view vendor stats" },
        { status: 403 }
      );
    }

    // Get all vendor counts
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ isActive: true });
    const verifiedVendors = await Vendor.countDocuments({ isVerified: true });
    const pendingVerification = await Vendor.countDocuments({ verificationStatus: "pending" });
    const rejectedVendors = await Vendor.countDocuments({ verificationStatus: "rejected" });

    // Get vendors with product counts
    const vendorsWithProducts = await Vendor.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "userId",
          foreignField: "createdBy",
          as: "products"
        }
      },
      {
        $project: {
          storeName: 1,
          isVerified: 1,
          verificationStatus: 1,
          productCount: { $size: "$products" },
          activeProducts: {
            $size: {
              $filter: {
                input: "$products",
                as: "product",
                cond: { $eq: ["$$product.isPublished", true] }
              }
            }
          }
        }
      }
    ]);

    // Calculate product statistics
    const totalProducts = vendorsWithProducts.reduce((sum, vendor) => sum + vendor.productCount, 0);
    const totalActiveProducts = vendorsWithProducts.reduce((sum, vendor) => sum + vendor.activeProducts, 0);
    
    // Vendors with no products
    const vendorsWithNoProducts = vendorsWithProducts.filter(vendor => vendor.productCount === 0).length;

    // Get top vendors by product count
    const topVendorsByProducts = vendorsWithProducts
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5)
      .map(vendor => ({
        storeName: vendor.storeName,
        productCount: vendor.productCount,
        activeProducts: vendor.activeProducts,
        isVerified: vendor.isVerified
      }));

    // Get vendor registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const vendorRegistrationTrends = await Vendor.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          count: 1
        }
      }
    ]);

    // Get document statistics
    const vendorsWithDocuments = await Vendor.aggregate([
      {
        $project: {
          storeName: 1,
          documentCount: { $size: "$documents" },
          pendingDocuments: {
            $size: {
              $filter: {
                input: "$documents",
                as: "doc",
                cond: { $eq: ["$$doc.status", "pending"] }
              }
            }
          },
          approvedDocuments: {
            $size: {
              $filter: {
                input: "$documents",
                as: "doc",
                cond: { $eq: ["$$doc.status", "approved"] }
              }
            }
          }
        }
      }
    ]);

    const totalDocuments = vendorsWithDocuments.reduce((sum, vendor) => sum + vendor.documentCount, 0);
    const pendingDocuments = vendorsWithDocuments.reduce((sum, vendor) => sum + vendor.pendingDocuments, 0);
    const approvedDocuments = vendorsWithDocuments.reduce((sum, vendor) => sum + vendor.approvedDocuments, 0);

    // Get vendor performance stats (if you have orders data)
    let orderStats = {};
    try {
      const vendorOrderStats = await Order.aggregate([
        {
          $unwind: "$items"
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $unwind: "$productDetails"
        },
        {
          $lookup: {
            from: "vendors",
            localField: "productDetails.createdBy",
            foreignField: "userId",
            as: "vendorDetails"
          }
        },
        {
          $unwind: "$vendorDetails"
        },
        {
          $group: {
            _id: "$vendorDetails._id",
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$items.price" },
            storeName: { $first: "$vendorDetails.storeName" }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: 5
        }
      ]);

      orderStats = {
        topVendorsByRevenue: vendorOrderStats,
        totalVendorRevenue: vendorOrderStats.reduce((sum, vendor) => sum + vendor.totalRevenue, 0)
      };
    } catch (error) {
      console.log("Order stats not available:", error.message);
      orderStats = {
        topVendorsByRevenue: [],
        totalVendorRevenue: 0
      };
    }

    const stats = {
      // Basic counts
      totalVendors,
      activeVendors,
      inactiveVendors: totalVendors - activeVendors,
      verifiedVendors,
      pendingVerification,
      rejectedVendors,
      
      // Verification percentages
      verificationRate: totalVendors > 0 ? (verifiedVendors / totalVendors * 100).toFixed(1) : 0,
      pendingRate: totalVendors > 0 ? (pendingVerification / totalVendors * 100).toFixed(1) : 0,

      // Product statistics
      productStats: {
        totalProducts,
        totalActiveProducts,
        vendorsWithNoProducts,
        averageProductsPerVendor: totalVendors > 0 ? (totalProducts / totalVendors).toFixed(1) : 0
      },

      // Document statistics
      documentStats: {
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        rejectionRate: totalDocuments > 0 ? ((totalDocuments - pendingDocuments - approvedDocuments) / totalDocuments * 100).toFixed(1) : 0
      },

      // Top performers
      topVendorsByProducts,
      
      // Registration trends
      registrationTrends: vendorRegistrationTrends,

      // Order statistics
      orderStats
    };

    return NextResponse.json({
      success: true,
      data: { stats },
    });

  } catch (error) {
    console.error("Get vendor stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching vendor statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}