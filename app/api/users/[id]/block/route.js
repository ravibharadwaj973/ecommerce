import { NextResponse } from "next/server";
import { connectDB } from "../../../config/db";
import User from "../../../models/users";
import { requireAuth } from "../../../auth/auth"; // ✅ custom JWT helper

// @desc    Block/Unblock user
// @route   PATCH /api/users/[id]/block
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
    let currentUserId;
    if (mongoose.Types.ObjectId.isValid(id)) {
      currentUserId = authUser._id ? authUser._id.toString() : authUser.id;
    } else {
      currentUserId = authUser.id;
    }

    if (id === currentUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot deactivate your own account" },
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
      { isActive },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: { user: updatedUser },
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
