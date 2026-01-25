import { NextResponse } from "next/server";
import Attribute from "../../../models/Attribute";
import { connectDB } from "../../../config/db";

export async function DELETE(request,context) {
  try {
    await connectDB();

    const {id} = await context.params;


    if (!id) {
      return NextResponse.json(
        { success: false, message: "Attribute ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Attribute.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Attribute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attribute deleted successfully",
    });

  } catch (error) {
    console.error("Delete attribute error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete attribute",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
