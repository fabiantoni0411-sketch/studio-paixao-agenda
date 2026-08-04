"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { formatBRL, formatDateBR } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <AdminGuard>
      <BookingsList />
    </AdminGuard>
  );
}

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
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
        Próximos agendamentos
      </h1>
      {bookings.length === 0 && (
        <p className="text-pink-700">Nenhum agendamento futuro.</p>
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
              {b.status === "cancelado" && (
                <p className="text-xs text-red-500 font-semibold">Cancelado</p>
              )}
            </div>
            {b.status !== "cancelado" && (
              <button
                onClick={() => cancelBooking(b.id)}
                className="text-sm font-semibold text-red-500 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
