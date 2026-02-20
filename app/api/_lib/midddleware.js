// middleware.js
import { NextResponse } from 'next/server';
import redis from './app/api/_lib/redis'; // Path to your redis.js

export async function middleware(request) {
  // Only protect API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
   
    // 1. Get User's IP address
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const key = `rate_limit:${ip}`;
//  console.log(ip)
    try {
      // 2. Increment the count in Redis
      const currentCount = await redis.incr(key);

      // 3. Set expiration if it's the first request (1 minute window)
      if (currentCount === 1) {
        await redis.expire(key, 60);
      }

      // 4. Check if they crossed the limit (e.g., 20 requests per minute)
      if (currentCount > 20) {
        return NextResponse.json(
          { success: false, message: "Too many requests. Slow down!" },
          { status: 429 }
        );
      }
    } catch (err) {
      // If Redis fails, we let the request go through (don't break the site)
      console.error("Redis Limit Error:", err);
    }
  }

  return NextResponse.next();
}

// Only run this middleware on API paths
export const config = {
  matcher: '/api/:path*',
};