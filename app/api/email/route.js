// app/api/email/route.js
import { NextResponse } from "next/server";
import { sendOtpEmail } from "../_lib/email"; // adjust path if needed

export async function GET() {
  try {
    const success = await sendOtpEmail(testEmail, testOtp);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully! Check your inbox/spam.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email. Check console for error logs.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error sending test email",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
