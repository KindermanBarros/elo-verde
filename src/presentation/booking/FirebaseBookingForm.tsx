"use client";
import { useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { reservationStatuses } from "@/domain/reservation/ReservationStatus";

const defaultForm = { name: "", email: "", phone: "", date: "", time: "", notes: "" };
const config = { apiKey: process.env.FIREBASE_API_KEY, authDomain: process.env.FIREBASE_AUTH_DOMAIN, projectId: process.env.FIREBASE_PROJECT_ID, appId: process.env.FIREBASE_APP_ID };
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config);
const firestore = getFirestore(firebaseApp);

export function FirebaseBookingForm() {
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    try {
      await addDoc(collection(firestore, "reservationIntents"), {
        ...form,
        status: reservationStatuses[0],
        updatedBy: "site",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setForm(defaultForm);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function update(name: keyof typeof defaultForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="w-full rounded-lg border border-stone-300 p-3" placeholder="Nome" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        <input className="w-full rounded-lg border border-stone-300 p-3" type="email" placeholder="E-mail" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        <input className="w-full rounded-lg border border-stone-300 p-3" placeholder="Telefone" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full rounded-lg border border-stone-300 p-3" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
          <input className="w-full rounded-lg border border-stone-300 p-3" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
        </div>
      </div>
      <textarea className="min-h-28 w-full rounded-lg border border-stone-300 p-3" placeholder="Observações (opcional)" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      <button disabled={status === "saving"} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {status === "saving" ? "Enviando..." : "Solicitar reserva"}
      </button>
      {status === "saved" && <p className="text-sm text-emerald-700">Recebemos sua solicitação. Em breve entraremos em contato.</p>}
      {status === "error" && <p className="text-sm text-red-700">Não foi possível enviar agora. Tente novamente.</p>}
    </form>
  );
}
