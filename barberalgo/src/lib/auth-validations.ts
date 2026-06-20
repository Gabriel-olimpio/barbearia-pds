import type { UserRole } from "@prisma/client";

export type RegistrationData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  specialty: string;
  accessCode: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_MINIMUM = 10;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value: unknown) {
  return text(value).toLowerCase();
}

export function parseRegistrationBody(body: unknown):
  | { data: RegistrationData }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Dados de cadastro inválidos." };
  }

  const payload = body as Record<string, unknown>;
  const role = text(payload.role).toUpperCase();
  const data: RegistrationData = {
    name: text(payload.name),
    email: normalizeEmail(payload.email),
    phone: text(payload.phone),
    password: typeof payload.password === "string" ? payload.password : "",
    role: role as UserRole,
    specialty: text(payload.specialty),
    accessCode: text(payload.accessCode),
  };

  if (!data.name || data.name.length < 3) {
    return { error: "Informe seu nome completo." };
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    return { error: "Informe um e-mail válido." };
  }

  if (data.phone.replace(/\D/g, "").length < PHONE_DIGITS_MINIMUM) {
    return { error: "Informe um telefone válido com DDD." };
  }

  if (data.password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  if (!(["CLIENT", "BARBER", "ADMIN"] as string[]).includes(data.role)) {
    return { error: "Selecione um perfil válido." };
  }

  if (data.role === "BARBER" && !data.specialty) {
    return { error: "Informe a especialidade profissional." };
  }

  return { data };
}
