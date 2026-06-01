"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export type ForgotState = { error?: string; success?: string } | undefined;

const emailSchema = z.string().email("Enter a valid email");
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// --- Forgot Password: generate token ---
export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = formData.get("email") as string;
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });

  // Always return success to avoid user enumeration
  if (!user) {
    return { success: "If that email is registered, a reset link has been sent." };
  }

  // Expire old tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Generate token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // In production, send email. For MVP we log the link to console.
  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3333"}/reset-password?token=${rawToken}`;
  console.log("\n[Vocaa] Password reset link for", email, ":\n", resetUrl, "\n");

  return { success: "If that email is registered, a reset link has been sent. (Check console in development)" };
}

// --- Reset Password: use token ---
export async function resetPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const rawToken = formData.get("token") as string;
  const password = formData.get("password") as string;

  const parsed = resetSchema.safeParse({ token: rawToken, password });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.used || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const newHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: newHash },
  });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  redirect("/login?reset=1");
}
