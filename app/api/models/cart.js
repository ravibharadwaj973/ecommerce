import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // IMPORTANT: Store RAW JSON, not subdocuments
    items: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Cart =
  mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
