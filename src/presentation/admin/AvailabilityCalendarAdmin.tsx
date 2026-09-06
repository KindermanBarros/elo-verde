"use client";

import { useMemo, useState } from "react";
import type { ReservationIntent } from "@/domain/reservation/ReservationIntent";

type Props = { items: ReservationIntent[]; selectedDate: string; onSelectDate: (date: string) => void; loading?: boolean };
const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const confirmedStatuses = new Set(["Reservado", "Quitado", "Visita"]);

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function AvailabilityCalendarAdmin({ items, selectedDate, onSelectDate, loading = false }: Props) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const reservationsByDate = useMemo(() => {
    const result = new Map<string, ReservationIntent[]>();
    items.forEach((item) => { if (item.date) result.set(item.date, [...(result.get(item.date) ?? []), item]); });
    return result;
  }, [items]);
  const monthItems = items.filter((item) => item.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`));
  const confirmed = monthItems.filter((item) => confirmedStatuses.has(item.status)).length;
  const pending = monthItems.filter((item) => item.status === "Pendente contato").length;
  const cells = [...Array(firstDay.getDay()).fill(null), ...Array.from({ length: lastDay.getDate() }, (_, index) => index + 1)];
  const label = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Visão geral</p><h2 className="mt-1 text-2xl font-semibold capitalize tracking-tight">{label}</h2><p className="mt-1 text-sm text-stone-500">Clique em uma data para filtrar as reservas.</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-lg border border-stone-300 px-3 py-2 text-stone-700 hover:bg-stone-50" aria-label="Mês anterior">←</button><button type="button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-lg border border-stone-300 px-3 py-2 text-stone-700 hover:bg-stone-50" aria-label="Próximo mês">→</button></div>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2 md:max-w-md md:gap-3"><div className="rounded-xl bg-stone-50 p-3"><p className="text-xs text-stone-500">Reservas no mês</p><p className="mt-1 text-xl font-semibold">{monthItems.length}</p></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Confirmadas</p><p className="mt-1 text-xl font-semibold text-emerald-900">{confirmed}</p></div><div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-700">Pendentes</p><p className="mt-1 text-xl font-semibold text-amber-900">{pending}</p></div></div>
    <div className="relative mt-6 min-h-64"><div className={`grid grid-cols-7 gap-1.5 md:gap-2 ${loading ? "animate-pulse opacity-50" : ""}`} role="grid" aria-busy={loading} aria-label={`Reservas de ${label}`}>
      {weekdays.map((day, index) => <div key={`${day}-${index}`} className="py-1 text-center text-xs font-semibold text-stone-400" role="columnheader">{day}</div>)}
      {cells.map((day, index) => {
        if (!day) return <div key={`empty-${index}`} />;
        const date = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
        const reservations = reservationsByDate.get(date) ?? [];
        const hasConfirmed = reservations.some((item) => confirmedStatuses.has(item.status));
        const hasPending = reservations.some((item) => item.status === "Pendente contato");
        const selected = selectedDate === date;
        return <button type="button" key={date} disabled={loading} onClick={() => onSelectDate(selected ? "" : date)} className={`min-h-16 rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm md:min-h-20 ${selected ? "border-emerald-600 ring-2 ring-emerald-200" : "border-stone-200"} ${hasConfirmed ? "bg-emerald-50" : hasPending ? "bg-amber-50" : "bg-white"}`} aria-label={`${day} de ${label}: ${reservations.length ? `${reservations.length} reserva(s)` : "livre"}`}><span className="text-sm font-semibold text-stone-800">{day}</span>{reservations.length > 0 ? <span className={`mt-2 block text-[11px] font-semibold ${hasConfirmed ? "text-emerald-800" : "text-amber-800"}`}>{reservations.length} {reservations.length === 1 ? "reserva" : "reservas"}</span> : <span className="mt-2 block text-[11px] text-stone-400">Livre</span>}</button>;
      })}
    </div>{loading && <div className="absolute inset-0 grid place-items-center"><div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-stone-600 shadow-sm"><span className="size-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />Carregando reservas...</div></div>}</div>
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-stone-600"><span><i className="mr-1 inline-block size-2 rounded-full bg-emerald-500" />Confirmada</span><span><i className="mr-1 inline-block size-2 rounded-full bg-amber-500" />Pendente</span><span><i className="mr-1 inline-block size-2 rounded-full border border-stone-300 bg-white" />Livre</span></div>
  </section>;
}
