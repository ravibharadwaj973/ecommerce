import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4, // similar to Sequelize UUIDV4
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [false, "Password is required"],
    },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
     googleId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
      require:true,
      validate: {
        validator: (v) => !v || /^[0-9]{10,15}$/.test(v),
        message: "Phone number must be 10–15 digits",
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);


// Prevent model overwrite errors in Next.js hot reload
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
