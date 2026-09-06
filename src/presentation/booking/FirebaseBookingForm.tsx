"use client";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { reservationStatuses } from "@/domain/reservation/ReservationStatus";
import { firestore } from "@/infrastructure/firebase/client";

const defaultForm = { name: "", email: "", phone: "", date: "", notes: "" };
type Props = { initialDate?: string };

export function FirebaseBookingForm({ initialDate = "" }: Props) {
  const [form, setForm] = useState({ ...defaultForm, date: initialDate });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [dateOccupied, setDateOccupied] = useState(false);
  useEffect(() => { setForm((current) => ({ ...current, date: initialDate })); }, [initialDate]);
  useEffect(() => {
    if (!form.date) { setDateOccupied(false); return; }
    fetch(`/api/availability?start=${form.date}&end=${form.date}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setDateOccupied(Boolean(data.days?.length)))
      .catch(() => setDateOccupied(false));
  }, [form.date]);

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
        <label className="space-y-1 text-sm font-medium">Nome<input className="w-full rounded-lg border border-stone-300 p-3 font-normal" placeholder="Como podemos chamar você?" value={form.name} onChange={(e) => update("name", e.target.value)} required /></label>
        <label className="space-y-1 text-sm font-medium">E-mail<input className="w-full rounded-lg border border-stone-300 p-3 font-normal" type="email" placeholder="voce@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required /></label>
        <label className="space-y-1 text-sm font-medium">Telefone<input className="w-full rounded-lg border border-stone-300 p-3 font-normal" placeholder="(92) 99999-9999" value={form.phone} onChange={(e) => update("phone", e.target.value)} required /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-medium md:col-span-2">Data da diária<input className="w-full rounded-lg border border-stone-300 p-3 font-normal" type="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(e) => update("date", e.target.value)} required />{dateOccupied && <span className="block text-sm text-rose-700">Essa data já está reservada. Escolha outro dia.</span>}</label>
        </div>
      </div>
      <label className="block space-y-1 text-sm font-medium">Observações<textarea className="min-h-28 w-full rounded-lg border border-stone-300 p-3 font-normal" placeholder="Conte algo que a equipe deve saber (opcional)" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
      <button disabled={status === "saving" || dateOccupied} className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {status === "saving" ? "Enviando..." : "Solicitar reserva"}
      </button>
      {status === "saved" && <p className="text-sm text-emerald-700">Recebemos sua solicitação. Em breve entraremos em contato.</p>}
      {status === "error" && <p className="text-sm text-red-700">Não foi possível enviar agora. Tente novamente.</p>}
    </form>
  );
}
