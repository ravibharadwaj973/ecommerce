import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const NewproductSchema = new mongoose.Schema(
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
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        format: { type: String, default: null },
        bytes: { type: Number, default: null },
        isPrimary: { type: Boolean, default: false },
        altText: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: String,
    tags: [],
    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.newProduct ||
  mongoose.model("newProduct", NewproductSchema);
