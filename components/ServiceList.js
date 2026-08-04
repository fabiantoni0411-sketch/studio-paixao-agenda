"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatBRL } from "@/lib/constants";

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (!error) setServices(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-center text-pink-700">Carregando serviços...</p>;
  }

  const cilios = services.filter((s) => s.category === "cilios");
  const sobrancelha = services.filter((s) => s.category === "sobrancelha");

  return (
    <div id="servicos" className="max-w-3xl mx-auto px-6 space-y-12">
      <div>
        <h2 className="font-title text-3xl text-pink-600 font-bold text-center mb-6">
          Alongamento de Cílios
        </h2>
        <div className="grid gap-4">
          {cilios.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-title text-3xl text-pink-600 font-bold text-center mb-6">
          Designer de Sobrancelha
        </h2>
        <div className="grid gap-4">
          {sobrancelha.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="font-bold text-pink-600">{service.name}</p>
        <p className="text-sm text-pink-900/80">
          Aplicação — {formatBRL(service.price_application)}
        </p>
        {service.price_maintenance ? (
          <p className="text-sm text-pink-900/80">
            Manutenção — {formatBRL(service.price_maintenance)}
          </p>
        ) : service.maintenance_note ? (
          <p className="text-sm text-pink-900/60">{service.maintenance_note}</p>
        ) : null}
      </div>
    </div>
  );
}
