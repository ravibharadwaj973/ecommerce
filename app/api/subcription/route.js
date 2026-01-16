import { NextResponse } from "next/server";
import {connectDB} from "../config/db";
import Subscription from "../models/subscription";
import SubscriptionPlan from "../models/subscriptionConfigSchema"
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
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { planId, paymentId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Plan is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch plan from DB (ADMIN-CONTROLLED)
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // 2️⃣ Check existing subscription
    const existing = await Subscription.findOne({ user: user.id });

    if (existing && existing.endsAt > new Date()) {
      return NextResponse.json(
        { success: false, message: "Subscription already active" },
        { status: 400 }
      );
    }

    // 3️⃣ Calculate dates from PLAN
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + plan.durationInDays);

    // 4️⃣ Create / Update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { user: user.id },
      {
        plan: plan._id,
        isActive: true,
        startsAt,
        endsAt,
        paymentId,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error("SUBSCRIPTION ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Subscription failed" },
      { status: 500 }
    );
  }
}
