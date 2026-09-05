# Agente de Contexto — Elo Verde

## Codename
**Elo Verde**

## Objetivo do app
Aplicação web para a **Chácara Elo Verde** com dois fluxos principais:
1. **Landing de agendamento** para visitantes escolherem horários via Cal.com.
2. **Painel administrativo** para autenticar com Firebase e atualizar o status das intenções de reserva.

## Referência da lógica principal
- **Domínio de reserva**
  - Status permitidos: `/home/runner/work/elo-verde/elo-verde/src/domain/reservation/ReservationStatus.ts`
  - Entidade de intenção: `/home/runner/work/elo-verde/elo-verde/src/domain/reservation/ReservationIntent.ts`
  - Contrato de repositório: `/home/runner/work/elo-verde/elo-verde/src/domain/reservation/ReservationIntentRepository.ts`

- **Caso de uso (aplicação)**
  - Atualização de status: `/home/runner/work/elo-verde/elo-verde/src/application/reservation/UpdateReservationStatus.ts`

- **Infraestrutura (Firebase/Firestore)**
  - Implementação do repositório de intenções: `/home/runner/work/elo-verde/elo-verde/src/infrastructure/firebase/FirestoreReservationIntentRepository.ts`
  - Inicialização Firebase Auth/Firestore: `/home/runner/work/elo-verde/elo-verde/src/infrastructure/firebase/client.ts`

- **Apresentação/UI**
  - Home com embed da agenda: `/home/runner/work/elo-verde/elo-verde/src/app/page.tsx`
  - Componente de embed Cal.com: `/home/runner/work/elo-verde/elo-verde/src/presentation/booking/CalBookingEmbed.tsx`
  - Página admin: `/home/runner/work/elo-verde/elo-verde/src/app/admin/page.tsx`
  - Cliente admin (login + gestão de status): `/home/runner/work/elo-verde/elo-verde/src/presentation/admin/AdminClient.tsx`

## Regras e fluxo de negócio resumidos
- Os status válidos de uma intenção são: **Pendente contato**, **Reservado**, **Quitado**, **Visita**.
- O painel admin lista documentos da coleção `reservationIntents` ordenados por `updatedAt`.
- Alterações de status persistem em Firestore com `updatedBy` e `updatedAt` (server timestamp).
- O front público depende de `NEXT_PUBLIC_CAL_LINK` para renderizar a agenda.

## Stack
- Next.js (App Router)
- React
- Firebase Auth + Firestore
