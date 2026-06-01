"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters").max(30),
  country: z.string().min(1, "Please select your country"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type ActionState = { error?: string } | undefined;

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    country: formData.get("country"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { username, country, email, password } = parsed.data;
  
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { error: "Email sudah terdaftar. Silakan gunakan email lain." };

  const existingUsername = await prisma.profile.findFirst({ where: { username } });
  if (existingUsername) return { error: "Username sudah digunakan. Silakan pilih username lain." };

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      // MVP: auto-verify so the demo flows end-to-end without email infra.
      emailVerified: true,
      profile: { create: { username, country } },
    },
  });

  await createSession({ userId: user.id, email: user.email });
  redirect("/onboarding");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
