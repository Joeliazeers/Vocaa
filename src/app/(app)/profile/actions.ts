"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ username: z.string().min(2).max(30) });

export async function updateUsername(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = schema.safeParse({ username: formData.get("username") });
  if (!parsed.success) return { error: "Username must be 2–30 characters." };

  await prisma.profile.update({
    where: { userId: session.userId },
    data: { username: parsed.data.username },
  });
  revalidatePath("/profile");
  return { ok: true };
}
