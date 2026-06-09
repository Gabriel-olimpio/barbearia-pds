export const SLOT_INTERVAL_MINUTES = 15;
export const FIRST_SLOT_START_MINUTES = 9 * 60;
export const LAST_SLOT_START_MINUTES = 19 * 60 + 45;
export const BUSINESS_END_MINUTES = 20 * 60;

export const WEEK_DAYS = [
  { dayOfWeek: 1, label: "Segunda-feira", shortLabel: "Seg" },
  { dayOfWeek: 2, label: "Terca-feira", shortLabel: "Ter" },
  { dayOfWeek: 3, label: "Quarta-feira", shortLabel: "Qua" },
  { dayOfWeek: 4, label: "Quinta-feira", shortLabel: "Qui" },
  { dayOfWeek: 5, label: "Sexta-feira", shortLabel: "Sex" },
  { dayOfWeek: 6, label: "Sabado", shortLabel: "Sab" },
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type TimeSlot = {
  label: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
};

export type AvailabilitySlot = {
  dayOfWeek: WeekDay["dayOfWeek"];
  startTimeMinutes: number;
  endTimeMinutes: number;
};

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

export function getTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (
    let startTimeMinutes = FIRST_SLOT_START_MINUTES;
    startTimeMinutes <= LAST_SLOT_START_MINUTES;
    startTimeMinutes += SLOT_INTERVAL_MINUTES
  ) {
    slots.push({
      label: minutesToTime(startTimeMinutes),
      startTimeMinutes,
      endTimeMinutes: startTimeMinutes + SLOT_INTERVAL_MINUTES,
    });
  }

  return slots;
}

export function getAvailabilitySlotValue(
  dayOfWeek: number,
  startTimeMinutes: number,
): string {
  return `${dayOfWeek}:${startTimeMinutes}`;
}

export function parseAvailabilitySlotValue(
  value: string,
): AvailabilitySlot | null {
  const [dayOfWeekValue, startTimeMinutesValue] = value.split(":");
  const dayOfWeek = Number(dayOfWeekValue);
  const startTimeMinutes = Number(startTimeMinutesValue);

  if (!Number.isInteger(dayOfWeek) || !Number.isInteger(startTimeMinutes)) {
    return null;
  }

  if (!WEEK_DAYS.some((weekDay) => weekDay.dayOfWeek === dayOfWeek)) {
    return null;
  }

  const isValidStartTime =
    startTimeMinutes >= FIRST_SLOT_START_MINUTES &&
    startTimeMinutes <= LAST_SLOT_START_MINUTES &&
    (startTimeMinutes - FIRST_SLOT_START_MINUTES) % SLOT_INTERVAL_MINUTES === 0;

  if (!isValidStartTime) {
    return null;
  }

  const endTimeMinutes = startTimeMinutes + SLOT_INTERVAL_MINUTES;

  if (endTimeMinutes > BUSINESS_END_MINUTES) {
    return null;
  }

  return {
    dayOfWeek: dayOfWeek as WeekDay["dayOfWeek"],
    startTimeMinutes,
    endTimeMinutes,
  };
}

export function formatTimeRange(
  startTimeMinutes: number,
  endTimeMinutes: number,
): string {
  return `${minutesToTime(startTimeMinutes)}-${minutesToTime(endTimeMinutes)}`;
}
