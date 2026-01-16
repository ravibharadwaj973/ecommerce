import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const redirectUrl = "http://localhost:3000/api/auth/google/callback";

  const url = `${GOOGLE_AUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=openid%20email%20profile`;

  return NextResponse.redirect(url);
}
