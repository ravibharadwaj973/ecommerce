import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip auth for public endpoints
  if (
    pathname.startsWith("/api/users/login") ||
    pathname.startsWith("/api/users/register")
  ) {
    return NextResponse.next(); // don’t apply middleware here
  }

  // Get token from cookie or Authorization header
  const cookieToken = request.cookies.get("token")?.value;
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET 
    );
    const role = decoded.role;

    // Role-based access control
    if (pathname.startsWith("/api/admin") && role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access only" },
        { status: 403 }
      );
    }

    if (
      pathname.startsWith("/api/vendor") &&
      !["admin", "vendor"].includes(role)
    ) {
      return NextResponse.json(
        { success: false, message: "Vendor or Admin access only" },
        { status: 403 }
      );
    }

    // Attach user info for downstream routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.id);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

// Run middleware only for /api routes
export const config = {
  matcher: ["/api/:path*"],
};
