import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const attributeValueSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },

    attribute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
      required: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

attributeValueSchema.index({ attribute: 1, value: 1 }, { unique: true });

export default mongoose.models.AttributeValue ||
  mongoose.model("AttributeValue", attributeValueSchema);
