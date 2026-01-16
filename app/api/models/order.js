import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4, // similar to Sequelize UUIDV4
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // references User model
      required: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      type: Object,
      required: [true, "Shipping address is required"],
      validate: {
        validator: (v) => typeof v === "object" && v !== null,
        message: "Shipping address must be a valid JSON object",
      },
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
          },
          size: {
            type: String,
            default: null,
          },
          color: {
            type: String,
            default: null,
          },
          price: {
            type: Number,
            required: true,
            min: [0, "Item price cannot be negative"],
          },
        },
      ],
      required: [true, "Items list is required"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Items must be a non-empty array",
      },
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Prevent OverwriteModelError during hot reload in Next.js
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
