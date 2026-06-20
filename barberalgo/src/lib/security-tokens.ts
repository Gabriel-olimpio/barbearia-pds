import { createHash, randomBytes, randomInt } from "crypto";
import type { UserRole } from "@prisma/client";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

function randomInvitePart(length: number) {
  return Array.from(
    { length },
    () => INVITE_ALPHABET[randomInt(0, INVITE_ALPHABET.length)],
  ).join("");
}

export function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase().replace(/\s/g, "");
}

export function createInviteCode(role: Extract<UserRole, "BARBER" | "ADMIN">) {
  const rolePrefix = role === "ADMIN" ? "ADM" : "PRO";
  return `BA-${rolePrefix}-${randomInvitePart(4)}-${randomInvitePart(4)}`;
}

export function getInviteHint(code: string) {
  return `${code.slice(0, 6)}••••-${code.slice(-4)}`;
}
