"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createBarberWithAvailabilities } from "@/lib/barber-repository";
import { parseAvailabilitySlotValue } from "@/lib/time-slots";

const TEMPORARY_PASSWORD_HASH = "temporary-password-hash";
const TEMPORARY_EMAIL_DOMAIN = "barberalgo.local";

function getRequiredText(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    throw new Error("Preencha todos os campos obrigatorios.");
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error("Preencha todos os campos obrigatorios.");
  }

  return trimmedValue;
}

function createTemporaryEmail(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
  const emailPrefix = slug || "barbeiro";

  return `${emailPrefix}.${Date.now()}.${randomUUID().slice(
    0,
    8,
  )}@${TEMPORARY_EMAIL_DOMAIN}`;
}

export async function createBarber(formData: FormData): Promise<void> {
  const name = getRequiredText(formData, "name");
  const phone = getRequiredText(formData, "phone");
  const availabilityValues = formData
    .getAll("availability")
    .filter((value): value is string => typeof value === "string");

  if (availabilityValues.length === 0) {
    throw new Error("Selecione pelo menos um horario disponivel.");
  }

  const availabilities = Array.from(new Set(availabilityValues)).map(
    (value) => {
      const availability = parseAvailabilitySlotValue(value);

      if (!availability) {
        throw new Error("Horario disponivel invalido.");
      }

      return availability;
    },
  );

  await createBarberWithAvailabilities({
    name,
    phone,
    email: createTemporaryEmail(name),
    passwordHash: TEMPORARY_PASSWORD_HASH,
    availabilities,
  });

  revalidatePath("/cadastro-barbeiros");
}
