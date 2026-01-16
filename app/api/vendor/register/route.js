import { NextResponse } from "next/server";
import Vendor from "../../models/Vendor";
import User from "../../models/users";
import { connectDB } from "../../config/db";
import jwt from "jsonwebtoken";

/* ---------------- HELPERS ---------------- */
const getUserFromRequest = async (request) => {
  const token = request.cookies.get("token")?.value;

  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return await User.findById(decoded.id);
};
const calculateVerificationScore = (vendorData) => {
  let score = 0;

  if (vendorData.storeName) score += 10;
  if (vendorData.storeDescription?.length > 50) score += 10;

  if (vendorData.gstNumber) score += 20;
  if (vendorData.panNumber) score += 20;

  const address = vendorData.businessAddress || {};
  if (address.addressLine1 && address.city && address.state && address.pincode) {
    score += 20;
  }

  if (vendorData.documents?.length > 0) score += 20;

  return score;
};

const getVerificationLevel = (score) => {
  if (score >= 80) return "full";
  if (score >= 50) return "intermediate";
  return "basic";
};

/* ---------------- POST ---------------- */

export async function POST(request) {
  try {
    await connectDB();
    
    await getUserFromRequest(request)

   

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* 🟢 ROLE LOGIC (YOUR REQUIREMENT) */
    if (user.role !== "vendor") {
      user.role = "vendor";
      await user.save();
    }


    /* ❌ Prevent duplicate vendor */
    const alreadyVendor = await Vendor.findOne({ userId: user._id });
    if (alreadyVendor) {
   
      return NextResponse.json(
        { success: false, message: "Vendor already registered" },
        { status: 400 }
      );
    }

    /* 📦 Vendor Data */
    const body = await request.json();
    const {
      storeName,
      storeDescription,
      gstNumber,
      panNumber,
      businessAddress,
      payoutDetails,
      documents = [],
    } = body;

    if (!storeName) {
      return NextResponse.json(
        { success: false, message: "Store name is required" },
        { status: 400 }
      );
    }

    /* ❌ Duplicate Store Name */
    const storeExists = await Vendor.findOne({
      storeName: { $regex: new RegExp(`^${storeName}$`, "i") },
    });

    if (storeExists) {
      return NextResponse.json(
        { success: false, message: "Store name already exists" },
        { status: 409 }
      );
    }

    /* 📊 Verification */
    const verificationScore = calculateVerificationScore(body);
    const verificationLevel = getVerificationLevel(verificationScore);

    /* ✅ Create Vendor */
    const vendor = await Vendor.create({
      userId: user._id,
      storeName,
      storeDescription: storeDescription || "",
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      businessAddress: businessAddress || {},
      payoutDetails: payoutDetails || {},
      documents,
      isVerified: false,
      verificationStatus: "pending",
      verificationScore,
      verificationLevel,
      createdBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vendor registered successfully",
        data: {
          user: {
            id: user._id,
            role: user.role,
            email: user.email,
          },
          vendor,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Vendor registration failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await Vendor.findOne({ userId: user._id }).select("-__v");

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Fetch vendor error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const vendor = await Vendor.findOne({ userId: user._id });

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    const { documents = [] } = await request.json();

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, message: "No documents provided" },
        { status: 400 }
      );
    }

    // Replace existing doc of same type or add new
    documents.forEach((doc) => {
      const index = vendor.documents.findIndex(
        (d) => d.type === doc.type
      );

      if (index !== -1) {
        vendor.documents[index].url = doc.url;
        vendor.documents[index].status = "pending";
        vendor.documents[index].uploadedAt = new Date();
      } else {
        vendor.documents.push({
          type: doc.type,
          url: doc.url,
          status: "pending",
        });
      }
    });

    // Recalculate verification score
    let score = vendor.verificationScore || 0;
    if (vendor.documents.length > 0) score = Math.min(100, score + 20);

    vendor.verificationScore = score;
    vendor.verificationLevel =
      score >= 80 ? "full" : score >= 50 ? "intermediate" : "basic";

    vendor.verificationStatus = "pending";

    await vendor.save();

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
