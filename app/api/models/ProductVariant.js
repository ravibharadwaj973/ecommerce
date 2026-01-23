import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const productVariantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newProduct",
      required: true,
    },

    attributes: [
      {
        attribute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        value: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeValue",
          required: true,
        },
      },
    ],

    sku: {
      type: String,
      required: true,
      unique: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProductVariant ||
  mongoose.model("ProductVariant", productVariantSchema);
