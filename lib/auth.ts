import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "webtrij-secret-key-2026-admin-login-token";
const COOKIE_NAME = "webtrij_admin_session";

// Base64Url helpers
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

async function signData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { id: number; username: string; email: string }): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60; // 1 day (24 hours)
  const body = base64UrlEncode(JSON.stringify({ ...payload, exp }));
  const signature = await signData(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<{ id: number; username: string; email: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = await signData(`${header}.${body}`);
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { id: payload.id, username: payload.username, email: payload.email };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const payload = await verifySessionToken(sessionToken);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getAuthenticatedAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || !user.role || user.role.trim().toUpperCase() !== "ADMIN") return null;
  return user;
}

export { COOKIE_NAME };
