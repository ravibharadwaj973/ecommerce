import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15,
    },

    country: {
      type: String,
      default: "IN",
      trim: true,
      maxlength: 100,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Ensure only one default address per user
addressSchema.index(
  { user: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

// ✅ Auto-unset previous default address
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.models.Address ||
  mongoose.model("Address", addressSchema);
