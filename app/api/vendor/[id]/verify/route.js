// app/api/vendors/[id]/verify/route.js
import { NextResponse } from "next/server";
import Vendor from "../../../models/Vendor";
import User from "../../../models/User";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";

// @desc    Verify/Reject vendor with document review (Admin only)
// @route   PATCH /api/vendors/[id]/verify
// @access  Private/Admin
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const adminUser = await requireAuth(request);
    if (adminUser instanceof NextResponse) return adminUser;

    if (adminUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only admin can verify vendors" },
        { status: 403 }
      );
    }

    const vendorId = params.id;
    const { status, reason, documentReviews } = await request.json(); 

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findById(vendorId).populate("userId");
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Update document statuses if provided
    if (documentReviews && Array.isArray(documentReviews)) {
      documentReviews.forEach(review => {
        const doc = vendor.documents.id(review.documentId);
        if (doc) {
          doc.status = review.status;
          doc.reviewNotes = review.notes;
          doc.reviewedBy = adminUser._id;
          doc.reviewedAt = new Date();
        }
      });
    }

    vendor.verificationStatus = status;
    vendor.isVerified = status === "approved";
    vendor.verifiedBy = adminUser._id;
    vendor.verifiedAt = new Date();
    
    if (reason) {
      vendor.verificationNotes = reason;
    }

    await vendor.save();

    return NextResponse.json({
      success: true,
      message: `Vendor ${status} successfully`,
      data: { vendor },
    });

  } catch (error) {
    console.error("Verify vendor error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying vendor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}