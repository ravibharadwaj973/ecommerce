import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderItemSchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    priceAtOrderTime: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Public order identifier
    orderNumber: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "created",     // order created from cart
        "paid",        // payment successful
        "failed",      // payment failed
        "cancelled",   // cancelled by user/admin
        "shipped",
        "delivered",
      ],
      default: "created",
      index: true,
    },

    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      provider: {
        type: String,
        default: "mock", // later razorpay/stripe
      },
      transactionId: {
        type: String,
        default: null,
      },
    },

    shippingAddress: {
       type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    shipment: {
  carrier: { type: String, default: null },      // Delhivery, Bluedart, etc.
  trackingNumber: { type: String, default: null },
  status: {
    type: String,
    enum: ["pending", "shipped", "in_transit", "delivered"],
    default: "pending",
  },
  shippedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
},
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
