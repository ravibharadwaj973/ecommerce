import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
 {
    name: {
      type: String,
      required: true, // "1 Month", "3 Months", "6 Months"
    },

    durationInDays: {
      type: Number,
      required: true, // 30, 90, 180
    },

    price: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Only ONE config document
export default mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
