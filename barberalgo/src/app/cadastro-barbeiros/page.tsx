import { connection } from "next/server";

import { createBarber } from "@/actions/barber-actions";
import {
  listBarbersWithAvailabilities,
  type BarberWithAvailabilities,
} from "@/lib/barber-repository";
import {
  formatTimeRange,
  getAvailabilitySlotValue,
  getTimeSlots,
  WEEK_DAYS,
  type WeekDay,
} from "@/lib/time-slots";

function getAvailabilityLabels(
  barber: BarberWithAvailabilities,
  dayOfWeek: WeekDay,
): string[] {
  return barber.availabilities
    .filter((availability) => availability.dayOfWeek === dayOfWeek.dayOfWeek)
    .map((availability) =>
      formatTimeRange(
        availability.startTimeMinutes,
        availability.endTimeMinutes,
      ),
    );
}

export default async function CadastroBarbeirosPage() {
  await connection();

  let barbers: BarberWithAvailabilities[] = [];
  let listError: string | null = null;

  try {
    barbers = await listBarbersWithAvailabilities();
  } catch {
    listError = "Nao foi possivel carregar os barbeiros cadastrados.";
  }

  const timeSlots = getTimeSlots();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            BarberAlgo
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Cadastro de barbeiros</h1>
        </header>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Novo barbeiro</h2>

          <form action={createBarber} className="mt-5 flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nome
                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900"
                  name="name"
                  required
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Telefone
                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none transition focus:border-zinc-900"
                  name="phone"
                  required
                  type="tel"
                />
              </label>
            </div>

            <fieldset className="flex flex-col gap-4">
              <legend className="text-sm font-semibold">
                Horarios disponiveis
              </legend>

              <div className="grid gap-4 lg:grid-cols-2">
                {WEEK_DAYS.map((weekDay) => (
                  <div
                    className="rounded-lg border border-zinc-200 p-4"
                    key={weekDay.dayOfWeek}
                  >
                    <h3 className="font-medium">{weekDay.label}</h3>
                    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {timeSlots.map((slot) => (
                        <label
                          className="cursor-pointer"
                          key={`${weekDay.dayOfWeek}-${slot.startTimeMinutes}`}
                        >
                          <input
                            className="peer sr-only"
                            name="availability"
                            type="checkbox"
                            value={getAvailabilitySlotValue(
                              weekDay.dayOfWeek,
                              slot.startTimeMinutes,
                            )}
                          />
                          <span className="flex min-h-10 items-center justify-center rounded-md border border-zinc-200 px-2 text-sm transition peer-checked:border-zinc-950 peer-checked:bg-zinc-950 peer-checked:text-white">
                            {slot.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            <button
              className="w-fit rounded-md bg-zinc-950 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-800"
              type="submit"
            >
              Cadastrar barbeiro
            </button>
          </form>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Barbeiros cadastrados</h2>
            <span className="text-sm text-zinc-500">
              {barbers.length} {barbers.length === 1 ? "barbeiro" : "barbeiros"}
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {listError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
                {listError}
              </p>
            ) : barbers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-5 text-zinc-600">
                Nenhum barbeiro cadastrado ainda.
              </p>
            ) : (
              barbers.map((barber) => (
                <article
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                  key={barber.id}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {barber.user.name}
                      </h3>
                      <p className="text-sm text-zinc-600">{barber.phone}</p>
                    </div>
                    <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {barber.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {WEEK_DAYS.map((weekDay) => {
                      const availabilityLabels = getAvailabilityLabels(
                        barber,
                        weekDay,
                      );

                      return (
                        <div
                          className="rounded-md border border-zinc-200 p-3"
                          key={weekDay.dayOfWeek}
                        >
                          <h4 className="text-sm font-semibold">
                            {weekDay.shortLabel}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">
                            {availabilityLabels.length > 0
                              ? availabilityLabels.join(", ")
                              : "Sem horarios"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
