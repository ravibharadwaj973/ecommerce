import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../../../models/users";
import { connectDB } from "../../../config/db";

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // 1️⃣ Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:3000/api/auth/google/callback",
      grant_type: "authorization_code",
      code
    })
  });

  const tokenData = await tokenRes.json();

  // 2️⃣ Fetch Google profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  const profile = await profileRes.json();

  // 3️⃣ Check if user exists
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    // 4️⃣ Create Google user
    user = await User.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.picture,
      provider: "google",
      googleId: profile.id,
      role: "customer",
    });
  }

  // 5️⃣ Create JWT
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  // 6️⃣ Set JWT cookie
  const response = NextResponse.redirect(process.env.VERCEL_URL||"https://ecommerce-one-delta-49.vercel.app/");

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
