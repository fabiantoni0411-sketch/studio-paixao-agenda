"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { formatBRL, formatDateBR } from "@/lib/constants";

function currentMonthValue() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}`;
}

function monthRange(value) {
  const [y, m] = value.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return {
    start: `${y}-${mm}-01`,
    end: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

function whatsappLink(phone) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = "55" + digits;
  return `https://wa.me/${digits}`;
}

export default function ClientesPage() {
  return (
    <AdminGuard>
      <ClientsOfMonth />
    </AdminGuard>
  );
}

function ClientsOfMonth() {
  const [month, setMonth] = useState(currentMonthValue());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { start, end } = monthRange(month);
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "concluido")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      setRows(data || []);
      setLoading(false);
    }
    if (month) load();
  }, [month]);

  const clientsMap = {};
  for (const r of rows) {
    const key = (r.client_phone || "").replace(/\D/g, "") || r.client_name;
    if (!clientsMap[key]) {
      clientsMap[key] = {
        name: r.client_name,
        phone: r.client_phone,
        items: [],
        total: 0,
      };
    }
    clientsMap[key].items.push(r);
    clientsMap[key].total += Number(r.price);
  }
  const clients = Object.values(clientsMap).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.price), 0);

  return (
    <div>
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-4">
        Clientes atendidas no mês
      </h1>

      <input
        type="month"
        className="input max-w-xs mb-6"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      {loading ? (
        <p className="text-pink-700">Carregando...</p>
      ) : (
        <>
          <div className="card p-5 mb-6 max-w-md flex gap-6">
            <div>
              <p className="text-2xl font-bold text-pink-600">{clients.length}</p>
              <p className="text-xs text-pink-900/70">clientes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">{rows.length}</p>
              <p className="text-xs text-pink-900/70">serviços</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">
                {formatBRL(totalRevenue)}
              </p>
              <p className="text-xs text-pink-900/70">faturamento</p>
            </div>
          </div>

          {clients.length === 0 && (
            <p className="text-pink-700 max-w-md">
              Nenhum atendimento concluído neste mês. Os atendimentos entram
              aqui quando você marca &quot;Concluído com sucesso&quot; em
              Agendamentos.
            </p>
          )}

          <div className="grid gap-3 max-w-xl">
            {clients.map((c) => (
              <div key={c.phone + c.name} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-bold text-pink-600">{c.name}</p>
                  <a
                    href={whatsappLink(c.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-green-600 hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
                <div className="space-y-1">
                  {c.items.map((it) => (
                    <p key={it.id} className="text-sm text-pink-900/80">
                      {formatDateBR(it.date)} — {it.service_name} (
                      {it.booking_type === "manutencao" ? "Manutenção" : "Aplicação"}
                      ) — {formatBRL(it.price)}
                    </p>
                  ))}
                </div>
                <p className="text-sm font-semibold text-pink-700 mt-2 pt-2 border-t border-pink-100">
                  Total no mês: {formatBRL(c.total)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
