import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "aceddi_hr_token";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var");
  return secret;
}

export type AuthTokenPayload = {
  uid: string;
  email: string;
  name: string;
};

export async function setAuthCookie(payload: AuthTokenPayload) {
  const token = jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthPayload(): Promise<AuthTokenPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

