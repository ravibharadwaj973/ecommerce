import { NextResponse } from 'next/server';

export async function GET() {
  // Use an environment variable for the domain, fallback to localhost for dev
  const baseUrl = process.env.VERCEL_URL || "http://localhost:3000";
  
  const redirectUrl = `${baseUrl}/api/auth/google/callback`;

  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  // Safety check for the Client ID
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google Client ID is missing" }, { status: 500 });
  }

  const url = `${googleAuthUrl}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=openid%20email%20profile`;

  return NextResponse.redirect(url);
}