import { randomUUID } from "node:crypto";

import postgres from "postgres";

import type { AvailabilitySlot } from "@/lib/time-slots";

const globalForPostgres = globalThis as unknown as {
  barberAlgoSql?: postgres.Sql;
};

function createSqlClient(): postgres.Sql {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to the database.");
  }

  return postgres(databaseUrl, {
    prepare: false,
  });
}

const sql = globalForPostgres.barberAlgoSql ?? createSqlClient();

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.barberAlgoSql = sql;
}

export type BarberWithAvailabilities = {
  id: string;
  phone: string | null;
  active: boolean;
  user: {
    name: string;
    email: string;
  };
  availabilities: AvailabilitySlot[];
};

export type CreateBarberInput = {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  availabilities: AvailabilitySlot[];
};

type BarberRow = {
  barberId: string;
  phone: string | null;
  active: boolean;
  userName: string;
  userEmail: string;
  dayOfWeek: number | null;
  startTimeMinutes: number | null;
  endTimeMinutes: number | null;
};

export async function createBarberWithAvailabilities({
  name,
  phone,
  email,
  passwordHash,
  availabilities,
}: CreateBarberInput): Promise<void> {
  await sql.begin(async (tx) => {
    const userId = randomUUID();
    const barberId = randomUUID();
    const now = new Date();

    await tx`
      INSERT INTO users (id, name, email, "passwordHash", role, "updatedAt")
      VALUES (${userId}, ${name}, ${email}, ${passwordHash}, 'BARBER'::"UserRole", ${now})
    `;

    await tx`
      INSERT INTO barber_profiles (id, "userId", phone, active, "updatedAt")
      VALUES (${barberId}, ${userId}, ${phone}, true, ${now})
    `;

    for (const availability of availabilities) {
      await tx`
        INSERT INTO availabilities (
          id,
          "barberId",
          "dayOfWeek",
          "startTimeMinutes",
          "endTimeMinutes",
          active,
          "updatedAt"
        )
        VALUES (
          ${randomUUID()},
          ${barberId},
          ${availability.dayOfWeek},
          ${availability.startTimeMinutes},
          ${availability.endTimeMinutes},
          true,
          ${now}
        )
      `;
    }
  });
}

export async function listBarbersWithAvailabilities(): Promise<
  BarberWithAvailabilities[]
> {
  const rows = await sql<BarberRow[]>`
    SELECT
      barber_profiles.id AS "barberId",
      barber_profiles.phone,
      barber_profiles.active,
      users.name AS "userName",
      users.email AS "userEmail",
      availabilities."dayOfWeek",
      availabilities."startTimeMinutes",
      availabilities."endTimeMinutes"
    FROM barber_profiles
    INNER JOIN users ON users.id = barber_profiles."userId"
    LEFT JOIN availabilities
      ON availabilities."barberId" = barber_profiles.id
      AND availabilities.active = true
    WHERE users.role = 'BARBER'::"UserRole"
    ORDER BY
      barber_profiles."createdAt" DESC,
      availabilities."dayOfWeek" ASC,
      availabilities."startTimeMinutes" ASC
  `;

  const barbersById = new Map<string, BarberWithAvailabilities>();

  for (const row of rows) {
    const barber =
      barbersById.get(row.barberId) ??
      ({
        id: row.barberId,
        phone: row.phone,
        active: row.active,
        user: {
          name: row.userName,
          email: row.userEmail,
        },
        availabilities: [],
      } satisfies BarberWithAvailabilities);

    if (!barbersById.has(row.barberId)) {
      barbersById.set(row.barberId, barber);
    }

    if (
      row.dayOfWeek !== null &&
      row.startTimeMinutes !== null &&
      row.endTimeMinutes !== null
    ) {
      barber.availabilities.push({
        dayOfWeek: row.dayOfWeek as AvailabilitySlot["dayOfWeek"],
        startTimeMinutes: row.startTimeMinutes,
        endTimeMinutes: row.endTimeMinutes,
      });
    }
  }

  return Array.from(barbersById.values());
}
