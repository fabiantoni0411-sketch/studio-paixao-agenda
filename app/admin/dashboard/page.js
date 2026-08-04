"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { formatBRL, formatDateBR } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <AdminGuard>
      <MonthSummary />
      <PendingBookings />
      <ConfirmedBookings />
    </AdminGuard>
  );
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

function MonthSummary() {
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { start, end } = getMonthRange();
      const { data } = await supabase
        .from("bookings")
        .select("price")
        .eq("status", "confirmado")
        .gte("date", start)
        .lte("date", end);
      const rows = data || [];
      setTotal(rows.reduce((sum, r) => sum + Number(r.price), 0));
      setCount(rows.length);
      setLoading(false);
    }
    load();
  }, []);

  const monthName = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card p-5 mb-8 max-w-md">
      <p className="text-sm font-semibold text-pink-700 mb-1 capitalize">
        Resumo de {monthName}
      </p>
      {loading ? (
        <p className="text-pink-700">Carregando...</p>
      ) : (
        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-bold text-pink-600">{count}</p>
            <p className="text-xs text-pink-900/70">agendamentos confirmados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-600">{formatBRL(total)}</p>
            <p className="text-xs text-pink-900/70">faturamento do mês</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pendente")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id, status) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    load();
  }

  if (loading) return null;
  if (bookings.length === 0) return null;

  return (
    <div className="mb-10">
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-4">
        Aguardando aprovação ({bookings.length})
      </h1>
      <div className="grid gap-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="card p-4 flex flex-wrap items-center justify-between gap-3 border-2 border-pink-300"
          >
            <div>
              <p className="font-bold text-pink-600">
                {formatDateBR(b.date)} às {b.start_time.slice(0, 5)}
              </p>
              <p className="text-sm text-pink-900/80">
                {b.service_name} ({b.booking_type === "manutencao" ? "Manutenção" : "Aplicação"}) —{" "}
                {formatBRL(b.price)}
                {b.payment_method ? ` · ${b.payment_method}` : ""}
              </p>
              <p className="text-sm text-pink-900/70">
                {b.client_name} · {b.client_phone}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => respond(b.id, "confirmado")}
                className="text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 rounded-full px-4 py-2"
              >
                Aceitar
              </button>
              <button
                onClick={() => respond(b.id, "recusado")}
                className="text-sm font-semibold text-red-500 hover:underline"
              >
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmado")
      .gte("date", todayStr)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelBooking(id) {
    if (!confirm("Cancelar este agendamento?")) return;
    await supabase.from("bookings").update({ status: "cancelado" }).eq("id", id);
    load();
  }

  if (loading) return <p className="text-pink-700">Carregando agendamentos...</p>;

  return (
    <div>
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-6">
        Próximos agendamentos confirmados
      </h1>
      {bookings.length === 0 && (
        <p className="text-pink-700">Nenhum agendamento confirmado por enquanto.</p>
      )}
      <div className="grid gap-3">
        {bookings.map((b) => (
          <div key={b.id} className="card p-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold text-pink-600">
                {formatDateBR(b.date)} às {b.start_time.slice(0, 5)}
              </p>
              <p className="text-sm text-pink-900/80">
                {b.service_name} ({b.booking_type === "manutencao" ? "Manutenção" : "Aplicação"}) —{" "}
                {formatBRL(b.price)}
                {b.payment_method ? ` · ${b.payment_method}` : ""}
              </p>
              <p className="text-sm text-pink-900/70">
                {b.client_name} · {b.client_phone}
              </p>
            </div>
            <button
              onClick={() => cancelBooking(b.id)}
              className="text-sm font-semibold text-red-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
