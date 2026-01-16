import subscription from "../models/subscription";

export async function requireSubscription(userId) {

  const sub = await subscription.findOne({ user: userId });

  if (!sub || sub.endsAt <= new Date()) {
    throw new Error("Subscription required");
  }
  

  return sub;
}