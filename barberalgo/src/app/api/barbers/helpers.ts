/** @format */

import { NextRequest } from "next/server";

export type BarberPayload = {
  name: string;
  phone: string;
  availabilities: {
    dayOfWeek: number;
    startTimeMinutes: number;
    endTimeMinutes: number;
  }[];
};

const FIRST_DAY_OF_WEEK = 1;
const LAST_DAY_OF_WEEK = 6;
const OPENING_TIME_MINUTES = 9 * 60;
const LAST_SLOT_START_MINUTES = 19 * 60 + 15;
const SLOT_INTERVAL_MINUTES = 15;

export function barberToResponse(barber: {
  id: string;
  userId: string;
  phone: string | null;
  user: {
    name: string;
  };
  availabilities: {
    dayOfWeek: number;
    startTimeMinutes: number;
    endTimeMinutes: number;
  }[];
}) {
  return {
    id: barber.id,
    userId: barber.userId,
    name: barber.user.name,
    phone: barber.phone ?? "",
    availabilities: normalizeAvailabilitySlots(barber.availabilities),
  };
}

function normalizeAvailabilitySlots(
  availabilities: {
    dayOfWeek: number;
    startTimeMinutes: number;
  }[],
) {
  const seenSlots = new Set<string>();

  return availabilities
    .flatMap((availability) => {
      const slotIsValid =
        availability.dayOfWeek >= FIRST_DAY_OF_WEEK &&
        availability.dayOfWeek <= LAST_DAY_OF_WEEK &&
        availability.startTimeMinutes >= OPENING_TIME_MINUTES &&
        availability.startTimeMinutes <= LAST_SLOT_START_MINUTES &&
        availability.startTimeMinutes % SLOT_INTERVAL_MINUTES === 0;

      if (!slotIsValid) {
        return [];
      }

      const slotKey = `${availability.dayOfWeek}-${availability.startTimeMinutes}`;

      if (seenSlots.has(slotKey)) {
        return [];
      }

      seenSlots.add(slotKey);

      return [
        {
          dayOfWeek: availability.dayOfWeek,
          startTimeMinutes: availability.startTimeMinutes,
          endTimeMinutes: availability.startTimeMinutes + SLOT_INTERVAL_MINUTES,
        },
      ];
    })
    .sort(
      (firstAvailability, secondAvailability) =>
        firstAvailability.dayOfWeek - secondAvailability.dayOfWeek ||
        firstAvailability.startTimeMinutes -
          secondAvailability.startTimeMinutes,
    );
}

export async function parseBarberPayload(request: NextRequest): Promise<
  | {
      data: BarberPayload;
    }
  | {
      error: string;
    }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      error: "Dados inválidos.",
    };
  }

  if (!body || typeof body !== "object") {
    return {
      error: "Dados inválidos.",
    };
  }

  const payload = body as Record<string, unknown>;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

  if (!name || !phone) {
    return {
      error: "Nome e telefone são obrigatórios.",
    };
  }

  const rawAvailabilities = Array.isArray(payload.availabilities)
    ? payload.availabilities
    : [];
  const seenSlots = new Set<string>();
  const availabilities: BarberPayload["availabilities"] = [];

  for (const rawAvailability of rawAvailabilities) {
    if (!rawAvailability || typeof rawAvailability !== "object") {
      return {
        error: "Horários disponíveis inválidos.",
      };
    }

    const availability = rawAvailability as Record<string, unknown>;
    const dayOfWeek = Number(availability.dayOfWeek);
    const startTimeMinutes = Number(availability.startTimeMinutes);

    if (
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < FIRST_DAY_OF_WEEK ||
      dayOfWeek > LAST_DAY_OF_WEEK ||
      !Number.isInteger(startTimeMinutes) ||
      startTimeMinutes < OPENING_TIME_MINUTES ||
      startTimeMinutes > LAST_SLOT_START_MINUTES ||
      startTimeMinutes % SLOT_INTERVAL_MINUTES !== 0
    ) {
      return {
        error:
          "Os horários devem ser de segunda a sábado, entre 09:00 e 19:45.",
      };
    }

    const slotKey = `${dayOfWeek}-${startTimeMinutes}`;

    if (seenSlots.has(slotKey)) {
      continue;
    }

    seenSlots.add(slotKey);
    availabilities.push({
      dayOfWeek,
      startTimeMinutes,
      endTimeMinutes: startTimeMinutes + SLOT_INTERVAL_MINUTES,
    });
  }

  availabilities.sort(
    (firstAvailability, secondAvailability) =>
      firstAvailability.dayOfWeek - secondAvailability.dayOfWeek ||
      firstAvailability.startTimeMinutes - secondAvailability.startTimeMinutes,
  );

  return {
    data: {
      name,
      phone,
      availabilities,
    },
  };
}

export const barberInclude = {
  user: {
    select: {
      name: true,
    },
  },
  availabilities: {
    where: {
      active: true,
    },
    orderBy: [
      {
        dayOfWeek: "asc" as const,
      },
      {
        startTimeMinutes: "asc" as const,
      },
    ],
  },
};
