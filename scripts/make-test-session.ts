/**
 * Dev helper: create (or reuse) a test user, fully onboarded with a learning
 * path, and print a valid session JWT cookie value for smoke testing.
 */
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-bytes-minimum",
);

async function main() {
  const email = "tester@vocaa.dev";
  const ja = await prisma.language.findUniqueOrThrow({ where: { code: "ja" } });

  let user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash("password123", 10),
        emailVerified: true,
        profile: {
          create: {
            username: "Tester",
            currentLanguageId: ja.id,
            goal: "education",
            level: "beginner",
            dailyTargetMin: 20,
            onboarded: true,
          },
        },
      },
      include: { profile: true },
    });

    await prisma.learningPath.create({
      data: { userId: user.id, languageId: ja.id, goal: "education", level: "beginner", dailyTargetMinutes: 20 },
    });

    const skills = await prisma.skill.findMany({ where: { languageId: ja.id } });
    for (const s of skills) {
      await prisma.skillProgress.create({
        data: { userId: user.id, skillId: s.id, unlocked: s.prerequisiteIds.trim() === "" },
      });
    }
  }

  const token = await new SignJWT({ userId: user.id, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  console.log(token);
}

main().finally(() => prisma.$disconnect());
