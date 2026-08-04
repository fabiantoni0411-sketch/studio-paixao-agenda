"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/admin/dashboard", label: "Agendamentos" },
  { href: "/admin/horarios", label: "Horários" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/galeria", label: "Galeria" },
];

export default function AdminSidebar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  return (
    <aside className="md:w-56 bg-white border-b md:border-b-0 md:border-r border-pink-100 p-4 flex md:flex-col gap-2">
      <p className="font-title text-pink-600 font-bold text-lg mb-2 hidden md:block">
        Studio Paixão
      </p>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="px-3 py-2 rounded-lg text-sm font-semibold text-pink-700 hover:bg-pink-50"
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="mt-auto px-3 py-2 rounded-lg text-sm font-semibold text-left text-red-500 hover:bg-red-50"
      >
        Sair
      </button>
    </aside>
  );
}
