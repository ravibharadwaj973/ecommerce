// app/models/Vendor.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Store Information
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    storeLogo: {
      type: String,
      default: null,
    },

    bannerImage: {
      type: String,
      default: null,
    },

    storeDescription: {
      type: String,
      default: "",
    },

    // Business Details
    gstNumber: {
      type: String,
      default: null,
      trim: true,
    },

    panNumber: {
      type: String,
      default: null,
      trim: true,
    },

    businessAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationLevel: {
      type: String,
      enum: ["basic", "intermediate", "full"],
      default: "basic",
    },

    verificationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    documents: [
      {
        type: {
          type: String, // "gst", "pan", "id", "license", "address_proof"
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: String, // Cloudinary public ID for deletion
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reviewedAt: Date,
        reviewNotes: String,
      },
    ],
    // Stats tracking
    lastActive: {
      type: Date,
      default: Date.now,
    },

    // Performance metrics
    performance: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 }, // for customer inquiries
    },

    // Subscription/Plan info (if you have vendor tiers)
    plan: {
      type: String,
      enum: ["basic", "professional", "enterprise"],
      default: "basic",
    },
    // Bank / Payout Details
    payoutDetails: {
      bankAccountName: String,
      bankAccountNumber: String,
      ifscCode: String,
      upi: String,
    },

    // Seller Statistics
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      pendingPayout: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },

    // Vendor Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Track who created this vendor (Admin who registered the vendor)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
