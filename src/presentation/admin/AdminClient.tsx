"use client";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";
import { firebaseAuth } from "@/infrastructure/firebase/client";
import { FirestoreReservationIntentRepository } from "@/infrastructure/firebase/FirestoreReservationIntentRepository";
import { UpdateReservationStatus } from "@/application/reservation/UpdateReservationStatus";
import { reservationStatuses, type ReservationStatus } from "@/domain/reservation/ReservationStatus";
import type { ReservationIntent } from "@/domain/reservation/ReservationIntent";

const repository = new FirestoreReservationIntentRepository();

export default function AdminClient() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<ReservationIntent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => firebaseAuth.onAuthStateChanged(setUser), []);
  useEffect(() => { if (user) repository.list().then(setItems).catch(() => setError("Não foi possível carregar os status.")); }, [user]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setError("");
    try { await signInWithEmailAndPassword(firebaseAuth, email, password); }
    catch { setError("E-mail ou senha inválidos."); }
  }

  async function loginWithGoogle() {
    setError("");
    try { await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); }
    catch { setError("Não foi possível entrar com Google."); }
  }

  async function changeStatus(id: string, status: ReservationStatus) {
    if (!user) return;
    await new UpdateReservationStatus(repository).execute(id, status, user.email ?? user.uid);
    setItems(await repository.list());
  }

  if (!user) return <main className="grid min-h-screen place-items-center bg-stone-950 p-6"><form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-7 text-stone-900"><h1 className="text-2xl font-semibold">Elo Verde · Administração</h1><input aria-label="E-mail" className="w-full rounded-lg border p-3" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required/><input aria-label="Senha" className="w-full rounded-lg border p-3" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required/>{error && <p className="text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-emerald-700 p-3 font-semibold text-white">Entrar</button><div className="flex items-center gap-3 text-xs text-stone-400"><span className="h-px flex-1 bg-stone-200" />ou<span className="h-px flex-1 bg-stone-200" /></div><button type="button" onClick={loginWithGoogle} className="w-full rounded-lg border border-stone-300 p-3 font-semibold">Entrar com Google</button></form></main>;

  return <main className="min-h-screen bg-stone-100 p-6 text-stone-900 md:p-10"><header className="mx-auto flex max-w-5xl items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Elo Verde</p><h1 className="text-3xl font-semibold">Intenções de reserva</h1></div><button onClick={() => signOut(firebaseAuth)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm">Sair</button></header><section className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-xl bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-stone-50 text-stone-600"><tr><th className="p-4">Reserva</th><th className="p-4">Atualização</th><th className="p-4">Status</th></tr></thead><tbody>{items.map((item) => <tr key={item.reservationId} className="border-t"><td className="p-4 font-mono text-xs">{item.reservationId}</td><td className="p-4">{item.updatedAt.toLocaleString("pt-BR")}</td><td className="p-4"><select value={item.status} onChange={(e) => changeStatus(item.reservationId, e.target.value as ReservationStatus)} className="rounded-md border border-stone-300 bg-white p-2">{reservationStatuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}{items.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-stone-500">Nenhuma intenção sincronizada ainda.</td></tr>}</tbody></table></section></main>;
}
