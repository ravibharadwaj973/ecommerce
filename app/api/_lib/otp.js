// lib/otp.js
import bcrypt from "bcryptjs";

export function generate4DigitOtp() {
  // ensures leading zeros are possible (e.g. "0073")
  const n = Math.floor(Math.random() * 10000);
  return String(n).padStart(4, "0");
}

export async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

export async function compareOtp(otp, otpHash) {
  return bcrypt.compare(otp, otpHash);
}
