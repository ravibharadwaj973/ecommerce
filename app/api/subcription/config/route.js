import { NextResponse } from "next/server";
import {connectDB} from "../../config/db";
import SubscriptionPlan from "../../models/subscriptionConfigSchema";

export async function GET() {
  try {
    await connectDB();

    const config = await SubscriptionPlan.find({isActive:true});

    if (!config) {
      return NextResponse.json(
        { success: false, message: "Subscription not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription config" },
      { status: 500 }
    );
  }
}
