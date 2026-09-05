"use client";
import dynamic from "next/dynamic";
const AdminClient = dynamic(() => import("@/presentation/admin/AdminClient"), { ssr: false });
export default function AdminPage() { return <AdminClient />; }
