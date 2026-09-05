import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Chácara Elo Verde", description: "Agende sua visita à Chácara Elo Verde." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
