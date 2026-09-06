"use client";
import { FirebaseBookingForm } from "@/presentation/booking/FirebaseBookingForm";
import backgroundImage from "@/assets/BackgroundImage.jpg";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage.src})` }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/30" />
        <div className="mx-auto grid min-h-[48vh] max-w-6xl content-center gap-8 px-6 py-20 md:grid-cols-[1.35fr_0.65fr] md:px-10">
          <div>
            <p className="mb-4 text-sm font-semibold tracking-[0.22em] text-emerald-400 uppercase">Chácara Elo Verde</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">Seu próximo momento de paz começa aqui.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-300">Escolha um horário para conhecer a chácara. A confirmação e todos os detalhes da reserva são conduzidos pela nossa equipe.</p>
            <a href="#agendamento" className="mt-8 inline-flex rounded-full bg-emerald-400 px-6 py-3 font-semibold text-emerald-950">Solicitar horário</a>
          </div>
          <aside className="self-end rounded-3xl border border-emerald-400/20 bg-emerald-950/40 p-6">
            <p className="text-sm font-semibold text-emerald-300">Como funciona</p>
            <ol className="mt-4 space-y-4 text-sm leading-6">
              <li>01 · Selecione data e horário.</li>
              <li>02 · Informe seus dados no formulário.</li>
              <li>03 · Nossa equipe entra em contato.</li>
            </ol>
          </aside>
        </div>
      </section>
      <section id="agendamento" className="bg-stone-100 px-4 py-12 text-stone-900 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7">
            <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">Agendamento</p>
            <h2 className="mt-2 text-3xl font-semibold">Solicite seu melhor horário</h2>
          </div>
          <FirebaseBookingForm />
        </div>
      </section>
    </main>
  );
}
