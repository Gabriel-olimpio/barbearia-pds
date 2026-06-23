import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import type { UserRole } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_NAME = "barberalgo_session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  sessionVersion: number;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET nao foi configurada.");
  }

  return "barberalgo-development-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedKey] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const storedKeyBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scrypt(
    password,
    salt,
    storedKeyBuffer.length,
  )) as Buffer;

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}

export function createSessionToken(
  userId: string,
  role: UserRole,
  sessionVersion: number,
) {
  const payload: SessionPayload = {
    userId,
    role,
    sessionVersion,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function parseSessionToken(token: string): SessionPayload | null {
  const [encodedPayload, receivedSignature] = token.split(".");

  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(),
    ) as SessionPayload;

    if (
      !payload.userId ||
      !["CLIENT", "BARBER", "ADMIN"].includes(payload.role) ||
      !Number.isInteger(payload.sessionVersion) ||
      payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};

export function getRouteForRole(role: UserRole) {
  if (role === "ADMIN") return "/servicos";
  return "/agendamentos";
}
