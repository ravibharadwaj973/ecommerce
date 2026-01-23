import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

 image: {
  url: { type: String, required: true },
  publicId: { type: String, required: true },
},
    // ✅ CATEGORY HIERARCHY
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate categories under same parent
categorySchema.index(
  { slug: 1, parentCategory: 1 },
  { unique: true }
);

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
