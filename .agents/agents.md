# AGENTS.md — Chácara Elo Verde

## Objetivo

Este repositório contém o site da Chácara Elo Verde e seu painel interno de reservas.

## Instruções de trabalho

- Preserve a arquitetura existente em `src/app`, `src/domain`, `src/application`, `src/infrastructure` e `src/presentation`.
- Mantenha a interface e as mensagens em português do Brasil.
- Faça alterações pequenas e focadas no pedido atual.
- Não versione `.env.local`, credenciais, chaves privadas ou dados de usuários.
- Após alterações de código, execute `npm run build`.
- Antes de concluir, execute `git diff --check` e verifique o estado do Git.

## Aplicação

- Framework: Next.js 16 com App Router.
- UI: React 19 e Tailwind CSS 4.
- Página pública: `src/app/page.tsx`.
- Formulário público: `src/presentation/booking/FirebaseBookingForm.tsx`.
- Painel: `src/app/admin/page.tsx` e `src/presentation/admin/AdminClient.tsx`.
- Imagem principal: `src/assets/BackgroundImage.jpg`.

## Reservas

- As solicitações públicas são gravadas em `reservationIntents`.
- O status inicial é `Pendente contato`.
- Status válidos: `Pendente contato`, `Reservado`, `Quitado` e `Visita`.
- O repositório Firestore está em `src/infrastructure/firebase/FirestoreReservationIntentRepository.ts`.
- A atualização de status passa por `src/application/reservation/UpdateReservationStatus.ts`.

## Firebase

- Projeto: `elo-verde-42aec`.
- Configuração local: `.env.local`.
- Associação do projeto: `.firebaserc`.
- Configuração de deploy: `firebase.json`.
- Authentication usa E-mail/senha e Google.
- O painel aceita apenas a conta administrativa `eloverdemanaus@gmail.com`.
- As regras do Firestore estão em `firestore.rules`.
- Visitantes podem criar solicitações validadas; somente a conta administrativa pode ler ou atualizar reservas.
- Para publicar regras, use `firebase deploy --only firestore:rules`.

## Commits

Use mensagens curtas e descritivas em português, por exemplo:

```text
adiciona imagem de fundo na hero
configura Firebase Auth e regras do Firestore
```
