"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default function ServicosPage() {
  return (
    <AdminGuard>
      <ServicesEditor />
    </AdminGuard>
  );
}

function ServicesEditor() {
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    setServices(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  function update(id, field, value) {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");
    for (const s of services) {
      await supabase
        .from("services")
        .update({
          name: s.name,
          duration_minutes: Number(s.duration_minutes),
          price_application: Number(s.price_application),
          price_maintenance: s.price_maintenance === "" ? null : Number(s.price_maintenance),
          maintenance_note: s.maintenance_note,
          active: s.active,
        })
        .eq("id", s.id);
    }
    setSaving(false);
    setMessage("Serviços atualizados!");
  }

  return (
    <div>
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-6">
        Serviços e valores
      </h1>
      <div className="grid gap-3 max-w-2xl">
        {services.map((s) => (
          <div key={s.id} className="card p-4 grid gap-2 md:grid-cols-2">
            <label className="text-xs font-semibold text-pink-700">
              Nome
              <input
                className="input mt-1"
                value={s.name}
                onChange={(e) => update(s.id, "name", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-pink-700">
              Duração (minutos)
              <input
                type="number"
                className="input mt-1"
                value={s.duration_minutes}
                onChange={(e) => update(s.id, "duration_minutes", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-pink-700">
              Preço aplicação (R$)
              <input
                type="number"
                step="0.01"
                className="input mt-1"
                value={s.price_application}
                onChange={(e) => update(s.id, "price_application", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-pink-700">
              Preço manutenção (R$, opcional)
              <input
                type="number"
                step="0.01"
                className="input mt-1"
                value={s.price_maintenance ?? ""}
                onChange={(e) => update(s.id, "price_maintenance", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-pink-700 md:col-span-2">
              Observação (ex: &quot;Não tem manutenção&quot;)
              <input
                className="input mt-1"
                value={s.maintenance_note ?? ""}
                onChange={(e) => update(s.id, "maintenance_note", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-pink-700">
              <input
                type="checkbox"
                checked={s.active}
                onChange={(e) => update(s.id, "active", e.target.checked)}
              />
              Ativo (visível para clientes)
            </label>
          </div>
        ))}
      </div>
      <button onClick={saveAll} disabled={saving} className="btn-primary mt-4">
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  );
}
