import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw && (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)) {
    throw new Error("Configure as credenciais administrativas do Firebase no servidor");
  }
  let account;
  if (raw) {
    const normalized = raw.replace(/^['"]|['"]$/g, "").replace(
      /("private_key"\s*:\s*")([\s\S]*?)("\s*,\s*"client_email")/,
      (_, prefix, privateKey, suffix) => `${prefix}${privateKey.replace(/\r?\n/g, "\\n")}${suffix}`,
    );
    account = JSON.parse(normalized);
  } else account = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
  };
  return { ...account, private_key: account.private_key.replace(/\\n/g, "\n") };
}

const adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount()) });
export const adminFirestore = getFirestore(adminApp);
