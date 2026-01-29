import subscription from "../models/subscription";

export async function requireSubscription(userId) {

  const sub = await subscription.findOne({ user: userId });
if (!sub || sub.endsAt <= new Date()) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Active subscription required to access this feature",
        code: "SUBSCRIPTION_REQUIRED" // Helpful for frontend logic
      }, 
      { status: 403 }
    );
  }

  return sub;
}