"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { phoneToAdminEmail } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/admin/dashboard");
    });
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = phoneToAdminEmail(phone);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Número ou senha incorretos.");
      return;
    }
    router.replace("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="card p-8 w-full max-w-sm space-y-4">
        <h1 className="font-title text-2xl text-pink-600 font-bold text-center">
          Painel Studio Paixão
        </h1>
        <input
          type="tel"
          placeholder="Número de celular"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
