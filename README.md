# Chácara Elo Verde

Agenda e painel administrativo da Chácara Elo Verde.

## Configuração

Copie `.env.example` para `.env.local` e preencha as credenciais do app Web do Firebase:

```text
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
```

Ative o provedor E-mail/senha no Firebase Authentication, crie o usuário da equipe e publique `firestore.rules` antes de usar o formulário público.

## Desenvolvimento

```bash
npm install
npm run dev
```

O painel administrativo fica em `/admin`.
