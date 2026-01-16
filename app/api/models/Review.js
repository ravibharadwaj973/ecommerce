import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const reviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4, // same as Sequelize UUIDV4
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to Product model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer",
      },
    },
    comment: {
      type: String,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      trim: true,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin moderation
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt
  }
);

// Prevent model overwrite errors during hot reload
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
