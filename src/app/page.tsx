"use client";
import { useState } from "react";
import { FirebaseBookingForm } from "@/presentation/booking/FirebaseBookingForm";
import { AvailabilityCalendar } from "@/presentation/booking/AvailabilityCalendar";
import backgroundImage from "@/assets/BackgroundImage.jpg";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState("");
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage.src})` }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,44,34,0.96)_0%,rgba(4,78,59,0.78)_38%,rgba(2,44,34,0.52)_72%,rgba(0,0,0,0.42)_100%)]" />
        <div className="mx-auto grid min-h-[48vh] max-w-6xl content-center gap-8 px-6 py-20 md:grid-cols-[1.35fr_0.65fr] md:px-10">
          <div className="hero-copy max-w-3xl">
            <p className="mb-4 text-sm font-semibold tracking-[0.22em] text-emerald-200 uppercase">Chácara Elo Verde</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">Seu próximo momento de paz começa aqui.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white">Escolha a data da sua diária na chácara. A confirmação e todos os detalhes da reserva são conduzidos pela nossa equipe.</p>
            <a href="#agendamento" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300">Solicitar reserva</a>
          </div>
          <aside className="self-end rounded-3xl border border-emerald-200/35 bg-emerald-950/80 p-6 text-white shadow-xl shadow-black/20 backdrop-blur-sm">
            <p className="text-sm font-semibold text-emerald-200">Como funciona</p>
            <ol className="mt-4 space-y-4 text-sm leading-6"><li>01 · Selecione a data da diária.</li><li>02 · Informe seus dados no formulário.</li><li>03 · Nossa equipe entra em contato.</li></ol>
          </aside>
        </div>
      </section>
      <section className="bg-stone-100 px-4 py-12 text-stone-900 md:px-10"><div className="mx-auto max-w-6xl"><div className="mb-7 max-w-2xl"><p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">Planeje sua visita</p><h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Veja os dias que combinam com você</h2></div><AvailabilityCalendar selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); document.getElementById("agendamento")?.scrollIntoView({ behavior: "smooth" }); }} /></div></section>
      <section id="agendamento" className="bg-stone-100 px-4 py-12 text-stone-900 md:px-10"><div className="mx-auto max-w-6xl"><div className="mb-7"><p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">Agendamento</p><h2 className="mt-2 text-3xl font-semibold">Reserve sua próxima diária</h2></div><FirebaseBookingForm initialDate={selectedDate} /></div></section>
    </main>
  );
}
