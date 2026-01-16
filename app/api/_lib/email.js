// app/api/_lib/email.js (example)
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to, otp) {
  try {
    await resend.emails.send({
      from: "Ravi <onboarding@resend.dev>", // valid format
      to,
      subject: "Otp validation ",
      html: `<p>Your OTP sher hi kehe de bolo sherr is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });
    return true;
  } catch (err) {
    console.error("Resend error:", err);
    return false;
  }
}
