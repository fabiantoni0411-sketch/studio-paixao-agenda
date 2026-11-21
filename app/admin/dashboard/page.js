js
"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { formatBRL, formatDateBR } from "@/lib/constants";

function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonthRange() {
  const now = new Date();
  const start = localDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = localDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return { start, end };
}

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <AdminGuard>
      <MonthSummary refreshKey={refreshKey} />
      <PendingBookings onChange={refresh} refreshKey={refreshKey} />
      <ToComplete onChange={refresh} refreshKey={refreshKey} />
      <UpcomingBookings onChange={refresh} refreshKey={refreshKey} />
    </AdminGuard>
  );
}

function BookingInfo({ b }) {
  return (
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
  );
}

function MonthSummary({ refreshKey }) {
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { start, end } = getMonthRange();
      const { data } = await supabase
        .from("bookings")
        .select("price")
        .eq("status", "concluido")
        .gte("date", start)
        .lte("date", end);
      const rows = data || [];
      setTotal(rows.reduce((sum, r) => sum + Number(r.price), 0));
      setCount(rows.length);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

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
            <p className="text-xs text-pink-900/70">serviços concluídos</p>
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

function PendingBookings({ onChange, refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pendente")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  async function respond(id, status) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    onChange();
  }

  if (loading || bookings.length === 0) return null;

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
            <BookingInfo b={b} />
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

function ToComplete({ onChange, refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "confirmado")
        .lte("date", localDateStr())
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  async function setStatus(id, status) {
    if (status === "cancelado" && !confirm("Cancelar este agendamento?")) return;
    await supabase.from("bookings").update({ status }).eq("id", id);
    onChange();
  }

  if (loading) return null;

  return (
    <div className="mb-10">
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-1">
        Atendimentos de hoje e anteriores
      </h1>
      <p className="text-sm text-pink-900/70 mb-4">
        Ao terminar o atendimento, toque em &quot;Concluído com sucesso&quot; para
        ele entrar no resumo do mês.
      </p>
      {bookings.length === 0 && (
        <p className="text-pink-700">Nenhum atendimento para concluir agora.</p>
      )}
      <div className="grid gap-3">
        {bookings.map((b) => (
          <div key={b.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <BookingInfo b={b} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStatus(b.id, "concluido")}
                className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-full px-4 py-2"
              >
                Concluído com sucesso
              </button>
              <button
                onClick={() => setStatus(b.id, "cancelado")}
                className="text-sm font-semibold text-red-500 hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingBookings({ onChange, refreshKey }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "confirmado")
        .gt("date", localDateStr())
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  async function cancelBooking(id) {
    if (!confirm("Cancelar este agendamento?")) return;
    await supabase.from("bookings").update({ status: "cancelado" }).eq("id", id);
    onChange();
  }

  if (loading) return <p className="text-pink-700">Carregando agendamentos...</p>;

  return (
    <div>
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-6">
        Próximos agendamentos confirmados
      </h1>
      {bookings.length === 0 && (
        <p className="text-pink-700">Nenhum agendamento futuro confirmado.</p>
      )}
      <div className="grid gap-3">
        {bookings.map((b) => (
          <div key={b.id} className="card p-4 flex flex-wrap items-center justify-between gap-2">
            <BookingInfo b={b} />
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
