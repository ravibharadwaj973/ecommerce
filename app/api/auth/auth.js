// app/api/_lib/auth.js
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Helper to extract and verify JWT token from cookies
export async function getUserFromRequest(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
     return decoded; 
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return null;
  }
}
// Helper for protecting private routes
export async function requireAuth(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  return user;
}