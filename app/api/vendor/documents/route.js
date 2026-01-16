// app/api/vendors/documents/upload/route.js
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

// @desc    Upload vendor documents
// @route   POST /api/vendors/documents/upload
// @access  Private (Vendor)
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Check if user is a vendor
    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor profile not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('type'); // "gst", "pan", "id", "license", "address_proof"

    if (!file || !documentType) {
      return NextResponse.json(
        { success: false, message: "File and document type are required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'vendor-documents',
          public_id: `vendor-${vendor._id}-${documentType}-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Add document to vendor's documents array
    const newDocument = {
      type: documentType,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      status: "pending",
      uploadedAt: new Date()
    };

    vendor.documents.push(newDocument);
    
    // Update verification status to pending if documents are uploaded
    if (vendor.verificationStatus === "pending") {
      vendor.verificationStatus = "pending";
    }
    
    await vendor.save();

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        document: newDocument
      }
    });

  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading document",
        error: error.message,
      },
      { status: 500 }
    );
  }
}