import { NextResponse } from "next/server";
import { connectDB } from "../../config/db";
import User from "../../models/users";
import { requireAuth } from "../../auth/auth"; // ✅ custom JWT helper
import mongoose from "mongoose";



// Simplified helper functions without mongoose dependency
async function findUserById(id) {
  // Try to find by _id first, then by custom id
  let user = await User.findById(id);
  if (!user) {
    user = await User.findOne({ id: id });
  }
  return user;
}

async function updateUserById(id, updateData, options = {}) {
  // Try to update by _id first, then by custom id
  let updatedUser = await User.findByIdAndUpdate(id, updateData, options);
  if (!updatedUser) {
    updatedUser = await User.findOneAndUpdate({ id: id }, updateData, options);
  }
  return updatedUser;
}

async function deleteUserById(id) {
  // Try to delete by _id first, then by custom id
  let result = await User.findByIdAndDelete(id);
  if (!result) {
    result = await User.findOneAndDelete({ id: id });
  }
  return result;
}

// @desc    Get user by ID
// @route   GET /api/users/[id]
// @access  Private (Admin)
export async function GET(request, context) {
  try {
    await connectDB();

    // Authenticate and authorize
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    // Only admin can access user details
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } =await context.params;

    const userData = await findUserById(id);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return user without password
    const userWithoutPassword = { ...userData._doc };
    delete userWithoutPassword.password;

    return NextResponse.json({
      success: true,
      message: "User fetched successfully",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Update user details
// @route   PUT /api/users/[id]
// @access  Private (Admin)
export async function PUT(request, context) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only admin can update users
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } =await context.params;
    const body = await request.json();

    const {
      name,
      email,
      role,
      phone,
      avatar,
      dateOfBirth,
      isActive,
    } = body;

    // Find user
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if email already exists (excluding current user)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: email.toLowerCase(), 
        $or: [
          { _id: { $ne: existingUser._id } },
          { id: { $ne: existingUser.id } }
        ]
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Validate role
    if (role && !["customer", "admin", "vendor"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, message: "Phone number must be 10-15 digits" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updatedUser = await updateUserById(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return user without password
    const userWithoutPassword = { ...updatedUser._doc };
    delete userWithoutPassword.password;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Delete user account
// @route   DELETE /api/users/[id]
// @access  Private (Admin)
export async function DELETE(request, context) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only admin can delete users
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const  {id}  =await context.params;

    // Prevent self-deletion
    const currentUser = await findUserById(authUser.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Current user not found" },
        { status: 404 }
      );
    }

    const targetUser = await findUserById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if trying to delete own account
    if (targetUser.id === currentUser.id || targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await deleteUserById(id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Activate/Deactivate user
// @route   PATCH /api/users/[id]/status
// @access  Private (Admin)
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only admin can activate/deactivate users
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive field is required and must be boolean" },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    const currentUser = await findUserById(authUser.id);
    const targetUser = await findUserById(id);
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if trying to deactivate own account
    if (targetUser.id === currentUser.id || targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserById(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return user without password
    const userWithoutPassword = { ...updatedUser._doc };
    delete userWithoutPassword.password;

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// @desc    Update user role
// @route   PATCH /api/users/[id]/role
// @access  Private (Admin)
export async function PATCH_ROLE(request, { params }) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only admin can update roles
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["customer", "admin", "vendor"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Valid role is required" },
        { status: 400 }
      );
    }

    // Prevent self-role change
    const currentUser = await findUserById(authUser.id);
    const targetUser = await findUserById(id);
    
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if trying to change own role
    if (targetUser.id === currentUser.id || targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserById(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return user without password
    const userWithoutPassword = { ...updatedUser._doc };
    delete userWithoutPassword.password;

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating user role",
        error: error.message,
      },
      { status: 500 }
    );
  }
}