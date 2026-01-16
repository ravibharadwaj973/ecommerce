
import { NextResponse } from "next/server";
import { connectDB } from "../../../config/db";
import User from "../../../models/users";
import { requireAuth } from "../../../auth/auth"; // ✅ custom JWT helper

// @desc    Update user role
// @route   PATCH /api/users/[id]/role
// @access  Private (Admin)

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only admin can update roles
 

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
    let currentUserId;
    if (mongoose.Types.ObjectId.isValid(id)) {
      currentUserId = authUser._id ? authUser._id.toString() : authUser.id;
    } else {
      currentUserId = authUser.id;
    }

    if (id === currentUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await updateUserById(
      id,
      { role },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      data: { user: updatedUser },
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