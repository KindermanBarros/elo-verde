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
  const [deleteTarget, setDeleteTarget] = useState<ReservationIntent | null>(null);
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
    catch (reason) {
      const code = typeof reason === "object" && reason && "code" in reason ? String(reason.code) : "";
      if (code === "auth/operation-not-allowed") setError("O login com Google ainda não está ativado no Firebase Authentication.");
      else if (code === "auth/unauthorized-domain") setError("Este domínio ainda não está autorizado no Firebase Authentication.");
      else if (code === "auth/popup-blocked") setError("O navegador bloqueou a janela de login. Permita popups para este site.");
      else setError("Não foi possível entrar com Google. Tente novamente.");
    }
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

  async function removeReservation() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await repository.remove(deleteTarget.reservationId);
      setItems((current) => current.filter((item) => item.reservationId !== deleteTarget.reservationId));
      setDeleteTarget(null);
    } catch { setError("Não foi possível remover a reserva."); }
    finally { setLoading(false); }
  }

  if (!user) return <main className="grid min-h-screen place-items-center bg-stone-950 p-6"><section className="w-full max-w-sm rounded-2xl bg-white p-7 text-center text-stone-900 shadow-xl"><div className="mx-auto mb-5 grid size-20 place-items-center overflow-hidden rounded-2xl bg-stone-50"><img src={logo.src} alt="Chácara Elo Verde" className="size-full object-contain p-2" /></div><p className="text-sm font-semibold text-emerald-700">Elo Verde</p><h1 className="mt-1 text-2xl font-semibold">Área administrativa</h1><p className="mt-2 text-sm leading-6 text-stone-500">Acesse as reservas da chácara com sua conta autorizada.</p>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<button type="button" onClick={loginWithGoogle} className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white p-3 font-semibold shadow-sm transition hover:bg-stone-50">Entrar com Google</button></section></main>;

  return <main className="min-h-screen bg-stone-100 p-6 text-stone-900 md:p-10">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Elo Verde</p><h1 className="text-3xl font-semibold">Reservas</h1><p className="mt-1 text-sm text-stone-500">{filteredItems.length} de {items.length} reservas</p></div><button onClick={() => signOut(firebaseAuth)} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm">Sair</button></header>
    <section className="mx-auto mt-8 max-w-7xl"><AvailabilityCalendarAdmin items={items} selectedDate={dateFilter} onSelectDate={setDateFilter} loading={loading} /><div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6"><div className="grid gap-3 md:grid-cols-[1fr_190px_170px]"><label className="text-sm font-medium">Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 p-3 font-normal" placeholder="Nome, contato, descrição ou código" /></label><label className="text-sm font-medium">Status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "Todos" | ReservationStatus)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 font-normal"><option>Todos</option>{reservationStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-sm font-medium">Data<input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 p-3 font-normal" /></label></div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-6 overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-3 font-semibold">Reserva</th><th className="p-3 font-semibold">Nome</th><th className="p-3 font-semibold">Data</th><th className="p-3 font-semibold">Contato</th><th className="p-3 font-semibold">Status</th><th className="p-3 font-semibold">Descrição</th><th className="p-3 font-semibold">Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="p-10 text-center text-stone-500"><span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700 align-[-2px]" />Carregando reservas...</td></tr> : filteredItems.map((item) => <tr key={item.reservationId} className="border-b border-stone-100 align-top last:border-0"><td className="p-3 font-mono text-xs text-stone-500" title={item.reservationId}>{item.reservationId.slice(0, 8)}…</td><td className="p-3 font-medium">{item.name || "—"}</td><td className="whitespace-nowrap p-3">{formatDate(item.date)}</td><td className="p-3"><div>{item.phone || "—"}</div><div className="text-xs text-stone-500">{item.email}</div></td><td className="p-3"><select value={item.status} onChange={(e) => changeStatus(item.reservationId, e.target.value as ReservationStatus)} className="rounded-md border border-stone-300 bg-white p-2">{reservationStatuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="max-w-xs p-3 text-stone-600">{item.notes || "—"}</td><td className="p-3"><button type="button" onClick={() => setDeleteTarget(item)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50">Remover</button></td></tr>)}{!loading && filteredItems.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-stone-500">Nenhuma reserva encontrada com esses filtros.</td></tr>}</tbody></table></div></div></section>
    {deleteTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/60 p-6" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"><div className="mx-auto grid size-16 place-items-center text-red-600"><svg viewBox="0 0 64 64" className="size-16" aria-hidden="true"><path fill="currentColor" d="M32 4 62 58H2L32 4Z" /><path fill="white" d="M29.5 20h5v20h-5zM29.5 44h5v5h-5z" /></svg></div><h2 id="delete-title" className="mt-3 text-xl font-semibold text-stone-900">Tem certeza?</h2><p className="mt-2 text-sm leading-6 text-stone-500">A reserva de <strong className="text-stone-700">{deleteTarget.name || "este cliente"}</strong> será removida permanentemente.</p><div className="mt-6 flex justify-center gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-700">Cancelar</button><button type="button" onClick={removeReservation} disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{loading ? "Removendo..." : "Sim, remover"}</button></div></div></div>}
  </main>;
}
