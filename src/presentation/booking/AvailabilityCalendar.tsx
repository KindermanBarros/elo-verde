"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityDay } from "@/domain/reservation/availability";

type Props = { selectedDate?: string; onSelectDate?: (date: string) => void };
const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function AvailabilityCalendar({ selectedDate, onSelectDate }: Props) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const start = dateKey(firstDay); const end = dateKey(lastDay);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    fetch(`/api/availability?start=${start}&end=${end}`, { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => active && setDays(data.days ?? []))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [start, end]);

  const occupiedDates = useMemo(() => new Set(days.map((day) => day.date)), [days]);
  const monthLabel = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const cells = [...Array(firstDay.getDay()).fill(null), ...Array.from({ length: lastDay.getDate() }, (_, index) => index + 1)];
  function moveMonth(amount: number) { setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)); }

  return <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_18px_60px_-30px_rgba(28,25,23,0.35)] md:p-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h3 className="text-xl font-semibold capitalize tracking-tight text-stone-900 md:text-2xl">{monthLabel}</h3><p className="text-sm text-stone-500">Clique em um dia livre para reservar a diária</p></div>
      <div className="flex items-center gap-2"><button onClick={() => moveMonth(-1)} className="rounded-lg border px-3 py-2 text-stone-700" aria-label="Mês anterior">←</button><button onClick={() => moveMonth(1)} className="rounded-lg border px-3 py-2 text-stone-700" aria-label="Próximo mês">→</button></div>
    </div>
    <div className="mt-6 grid grid-cols-7 gap-2 md:gap-3" role="grid" aria-label={`Disponibilidade de ${monthLabel}`}>
      {weekdays.map((weekday, index) => <div key={`${weekday}-${index}`} className="py-1 text-center text-xs font-bold text-stone-500" role="columnheader">{weekday}</div>)}
      {cells.map((day, index) => {
        if (!day) return <div key={`empty-${index}`} />;
        const date = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const occupied = occupiedDates.has(date);
        const past = date < dateKey(new Date());
        return <button type="button" key={date} disabled={past || occupied || loading || error} onClick={() => onSelectDate?.(date)} aria-label={`${day}: ${past || occupied ? "indisponível" : "livre"}`} className={`grid aspect-[1.35] place-items-center rounded-lg border text-base font-semibold transition md:rounded-xl md:text-lg ${selectedDate === date ? "ring-2 ring-emerald-700 ring-offset-2" : ""} ${past ? "border-stone-100 bg-stone-50 text-stone-300" : occupied ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100"}`}>{day}</button>;
      })}
    </div>
    <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium text-stone-600" aria-label="Legenda"><span>🟢 Dia livre</span><span>🔴 Dia reservado</span></div>
    {loading && <p className="mt-4 text-sm text-stone-500">Consultando disponibilidade...</p>}
    {error && <p className="mt-4 text-sm text-rose-700">Não foi possível carregar a agenda. Tente atualizar a página.</p>}
  </div>;
}
