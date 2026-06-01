import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-bytes-minimum",
);

// Routes that require authentication.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/flashcards",
  "/conversation",
  "/leaderboard",
  "/achievements",
  "/profile",
  "/journal",
  "/onboarding",
];

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("vocaa_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  if (!(await isAuthed(req))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/flashcards/:path*",
    "/conversation/:path*",
    "/leaderboard/:path*",
    "/achievements/:path*",
    "/profile/:path*",
    "/journal/:path*",
    "/onboarding/:path*",
  ],
};
