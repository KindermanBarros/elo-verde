"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import logo from "@/assets/Logo.jpg";
import { firebaseAuth } from "@/infrastructure/firebase/client";
import { FirestoreReservationIntentRepository } from "@/infrastructure/firebase/FirestoreReservationIntentRepository";
import { UpdateReservationStatus } from "@/application/reservation/UpdateReservationStatus";
import { reservationStatuses, type ReservationStatus } from "@/domain/reservation/ReservationStatus";
import type { ReservationIntent } from "@/domain/reservation/ReservationIntent";
import { AvailabilityCalendarAdmin } from "@/presentation/admin/AvailabilityCalendarAdmin";

const repository = new FirestoreReservationIntentRepository();

function formatDate(date: string) {
  if (!date) return "—";
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-BR");
}

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ReservationIntent[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | ReservationStatus>("Todos");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => firebaseAuth.onAuthStateChanged(setUser), []);
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    repository.list().then(setItems).catch(() => setError("Não foi possível carregar as reservas.")).finally(() => setLoading(false));
  }, [user]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const searchable = [item.reservationId, item.name, item.email, item.phone, item.notes].join(" ").toLocaleLowerCase("pt-BR");
      return (!term || searchable.includes(term)) && (statusFilter === "Todos" || item.status === statusFilter) && (!dateFilter || item.date === dateFilter);
    });
  }, [dateFilter, items, search, statusFilter]);

  async function loginWithGoogle() {
    setError("");
    try { await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); }
    catch { setError("Não foi possível entrar com Google."); }
  }

  async function changeStatus(id: string, status: ReservationStatus) {
    if (!user) return;
    setLoading(true);
    try {
      await new UpdateReservationStatus(repository).execute(id, status, user.email ?? user.uid);
      setItems(await repository.list());
    } catch { setError("Não foi possível atualizar o status."); }
    finally { setLoading(false); }
  }

  if (!user) return <main className="grid min-h-screen place-items-center bg-stone-950 p-6"><section className="w-full max-w-sm rounded-2xl bg-white p-7 text-center text-stone-900 shadow-xl"><div className="mx-auto mb-5 grid size-20 place-items-center overflow-hidden rounded-2xl bg-stone-50"><img src={logo.src} alt="Chácara Elo Verde" className="size-full object-contain p-2" /></div><p className="text-sm font-semibold text-emerald-700">Elo Verde</p><h1 className="mt-1 text-2xl font-semibold">Área administrativa</h1><p className="mt-2 text-sm leading-6 text-stone-500">Acesse as reservas da chácara com sua conta autorizada.</p>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<button type="button" onClick={loginWithGoogle} className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white p-3 font-semibold shadow-sm transition hover:bg-stone-50"><svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.04H3.28v2.53A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.53 13.68a5.84 5.84 0 0 1 0-3.36V7.79H3.28a9.75 9.75 0 0 0 0 8.42l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.28c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.4 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 8 9.46 6.28 12 6.28Z"/></svg>Entrar com Google</button></section></main>;

  return <main className="min-h-screen bg-stone-100 p-6 text-stone-900 md:p-10"><header className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Elo Verde</p><h1 className="text-3xl font-semibold">Reservas</h1><p className="mt-1 text-sm text-stone-500">{filteredItems.length} de {items.length} reservas</p></div><button onClick={() => signOut(firebaseAuth)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm">Sair</button></header><section className="mx-auto mt-8 max-w-7xl"><AvailabilityCalendarAdmin items={items} selectedDate={dateFilter} onSelectDate={setDateFilter} loading={loading} /><div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6"><div className="grid gap-3 md:grid-cols-[1fr_190px_170px]"><label className="text-sm font-medium">Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 p-3 font-normal" placeholder="Nome, contato, descrição ou código" /></label><label className="text-sm font-medium">Status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "Todos" | ReservationStatus)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 font-normal"><option>Todos</option>{reservationStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-sm font-medium">Data<input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 p-3 font-normal" /></label></div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-3 font-semibold">Reserva</th><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">Data</th><th className="p-3 font-semibold">Contato</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Descrição</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-10 text-center text-stone-500"><span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700 align-[-2px]" />Carregando reservas...</td></tr> : filteredItems.map((item) => <tr key={item.reservationId} className="border-b border-stone-100 align-top last:border-0"><td className="p-3 font-mono text-xs text-stone-500" title={item.reservationId}>{item.reservationId.slice(0, 8)}…</td><td className="p-3 font-medium">{item.name || "—"}</td><td className="whitespace-nowrap p-3">{formatDate(item.date)}</td><td className="p-3"><div>{item.phone || "—"}</div><div className="text-xs text-stone-500">{item.email}</div></td><td className="p-3"><select value={item.status} onChange={(e) => changeStatus(item.reservationId, e.target.value as ReservationStatus)} className="rounded-md border border-stone-300 bg-white p-2">{reservationStatuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="max-w-xs p-3 text-stone-600">{item.notes || "—"}</td></tr>)}{!loading && filteredItems.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-stone-500">Nenhuma reserva encontrada com esses filtros.</td></tr>}</tbody></table></div></div></section></main>;
}
