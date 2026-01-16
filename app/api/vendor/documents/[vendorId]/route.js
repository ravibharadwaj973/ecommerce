// app/api/vendors/documents/[vendorId]/route.js
import { NextResponse } from "next/server";
import Vendor from "../../../models/Vendor";
import { connectDB } from "../../../config/db";
import { requireAuth } from "../../../auth/auth";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get vendor documents (Admin or vendor themselves)
// @route   GET /api/vendors/documents/[vendorId]
// @access  Private
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const vendorId = params.vendorId;
    const vendor = await Vendor.findById(vendorId).select('documents userId');

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check access rights
    if (user.role !== "admin" && vendor.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { documents: vendor.documents },
    });

  } catch (error) {
    console.error("Get vendor documents error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching vendor documents",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete vendor document
// @route   DELETE /api/vendors/documents/[vendorId]
// @access  Private (Vendor themselves)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const vendorId = params.vendorId;
    const { documentId } = await request.json();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Only vendor can delete their own documents
    if (vendor.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Find the document
    const document = vendor.documents.id(documentId);
    if (!document) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId);
    }

    // Remove from array
    vendor.documents.pull(documentId);
    await vendor.save();

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting document",
        error: error.message,
      },
      { status: 500 }
    );
  }
}