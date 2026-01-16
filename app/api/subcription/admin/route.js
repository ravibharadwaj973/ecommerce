import { NextResponse } from "next/server";
import {connectDB} from "../../config/db";
import SubscriptionPlan from "../../models/subscriptionConfigSchema";
import { requireAuth } from "../../auth/auth";

export async function PUT(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { name,price, durationInDays } = await request.json();

    if (!price) {
      return NextResponse.json(
        { success: false, message: "Price is required" },
        { status: 400 }
      );
    }
 
    const config = await SubscriptionPlan.findOneAndUpdate(
      {},
      {
        name,
        price,
        durationInDays,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update subscription config" },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    const { name, durationInDays, price } = await request.json();

    const plan = await SubscriptionPlan.create({
      name,
      durationInDays,
      price,
    });

    return NextResponse.json({ success: true, data: plan });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create plan" },
      { status: 500 }
    );
  }
}
