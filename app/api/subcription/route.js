import { NextResponse } from "next/server";
import { connectDB } from "../config/db";
import Subscription from "../models/subscription";
import SubscriptionPlan from "../models/subscriptionConfigSchema";
import { requireAuth } from "../auth/auth";
import { requireSubscription } from "../auth/subscriptionmiddleware";

export async function GET(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);

    if (user instanceof NextResponse) return user;

    const subscription = await requireSubscription(user.id);

    if (subscription instanceof NextResponse) return subscription;

    return NextResponse.json({
      success: true,
      subscribed: subscription,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed chal to fetch subscription" },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { planId, paymentId } = await request.json();

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid Plan" },
        { status: 400 },
      );
    }

    const existing = await Subscription.findOne({ user: user.id });

    // Logic: If active, extend it. If expired/none, start fresh.
    let startsAt = new Date();
    if (existing && existing.endsAt > new Date() && existing.isActive) {
      startsAt = new Date(existing.endsAt);
    }

    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + plan.durationInDays);

    const subscription = await Subscription.findOneAndUpdate(
      { user: user.id },
      {
        plan: plan._id,
        isActive: true,
        startsAt,
        endsAt,
        paymentId,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, data: subscription });
  } catch (err) {
    console.error("SUBSCRIPTION ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Purchase failed" },
      { status: 500 },
    );
  }
}
