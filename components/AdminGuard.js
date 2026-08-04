"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminSidebar from "./AdminSidebar";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin");
        return;
      }
      setAuthed(true);
      setChecking(false);
    }
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return <p className="text-center py-16 text-pink-700">Verificando acesso...</p>;
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
