
"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { WEEKDAY_NAMES, formatDateBR } from "@/lib/constants";

export default function HorariosPage() {
  return (
    <AdminGuard>
      <WeeklyHours />
      <BlockedDates />
    </AdminGuard>
  );
}

function WeeklyHours() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newBlock, setNewBlock] = useState({});

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("working_hours")
      .select("*")
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");
    for (const r of rows) {
      await supabase
        .from("working_hours")
        .update({ start_time: r.start_time, end_time: r.end_time })
        .eq("id", r.id);
    }
    setSaving(false);
    setMessage("Horários salvos!");
  }

  async function removeBlock(id) {
    await supabase.from("working_hours").delete().eq("id", id);
    load();
  }

  async function addBlock(weekday) {
    const block = newBlock[weekday];
    if (!block?.start || !block?.end) return;
    await supabase.from("working_hours").insert({
      weekday,
      start_time: block.start,
      end_time: block.end,
      active: true,
    });
    setNewBlock((prev) => ({ ...prev, [weekday]: { start: "", end: "" } }));
    load();
  }

  if (loading) return <p className="text-pink-700">Carregando horários...</p>;

  const byWeekday = {};
  for (let w = 0; w < 7; w++) byWeekday[w] = rows.filter((r) => r.weekday === w);

  return (
    <div className="mb-10">
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-2">
        Dias e horários de atendimento
      </h1>
      <p className="text-sm text-pink-900/70 mb-4">
        Adicione um ou mais blocos de horário por dia (ex: manhã 08:00–10:00 e
        tarde 14:00–17:00). Um dia sem nenhum bloco fica fechado.
      </p>

      <div className="grid gap-6 max-w-xl">
        {Array.from({ length: 7 }, (_, w) => w).map((w) => (
          <div key={w} className="card p-4">
            <p className="font-bold text-pink-600 mb-3">{WEEKDAY_NAMES[w]}</p>

            {byWeekday[w].length === 0 && (
              <p className="text-sm text-pink-900/60 mb-3">Fechado nesse dia</p>
            )}

            <div className="space-y-2 mb-3">
              {byWeekday[w].map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <input
                    type="time"
                    className="input w-28"
                    value={r.start_time?.slice(0, 5)}
                    onChange={(e) => updateRow(r.id, "start_time", e.target.value)}
                  />
                  <span className="text-sm text-pink-700">até</span>
                  <input
                    type="time"
                    className="input w-28"
                    value={r.end_time?.slice(0, 5)}
                    onChange={(e) => updateRow(r.id, "end_time", e.target.value)}
                  />
                  <button
                    onClick={() => removeBlock(r.id)}
                    className="text-xs font-semibold text-red-500 hover:underline ml-1"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-pink-100">
              <input
                type="time"
                className="input w-28"
                value={newBlock[w]?.start || ""}
                onChange={(e) =>
                  setNewBlock((prev) => ({ ...prev, [w]: { ...prev[w], start: e.target.value } }))
                }
              />
              <span className="text-sm text-pink-700">até</span>
              <input
                type="time"
                className="input w-28"
                value={newBlock[w]?.end || ""}
                onChange={(e) =>
                  setNewBlock((prev) => ({ ...prev, [w]: { ...prev[w], end: e.target.value } }))
                }
              />
              <button
                onClick={() => addBlock(w)}
                className="text-xs font-semibold text-pink-600 hover:underline ml-1"
              >
                + Adicionar bloco
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={saveAll} disabled={saving} className="btn-primary mt-4">
        {saving ? "Salvando..." : "Salvar alterações de horário"}
      </button>
      {message && <p className="text-green-600 mt-2">{message}</p>}
    </div>
  );
}

function BlockedDates() {
  const [list, setList] = useState([]);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });
    setList(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addBlock(e) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    await supabase.from("blocked_dates").insert({
      date,
      all_day: allDay,
      start_time: allDay ? null : startTime,
      end_time: allDay ? null : endTime,
      note,
    });
    setDate("");
    setNote("");
    setAllDay(true);
    setStartTime("");
    setEndTime("");
    setSaving(false);
    load();
  }

  async function removeBlock(id) {
    await supabase.from("blocked_dates").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h2 className="font-title text-2xl text-pink-600 font-bold mb-2">
        Dias/horários especiais (folgas, feriados)
      </h2>
      <p className="text-sm text-pink-900/70 mb-4">
        Use isto para um dia específico diferente do normal (ex: fechar num
        feriado, ou trabalhar só um horário reduzido naquele dia). Isso
        substitui os blocos da semana só naquela data.
      </p>
      <form onSubmit={addBlock} className="card p-4 max-w-xl space-y-3 mb-6">
        <input
          type="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 font-semibold text-pink-700">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          Dia inteiro fechado
        </label>
        {!allDay && (
          <div className="flex gap-3">
            <input
              type="time"
              className="input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="Início"
            />
            <input
              type="time"
              className="input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Fim"
            />
          </div>
        )}
        <input
          type="text"
          className="input"
          placeholder="Observação (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      <div className="grid gap-2 max-w-xl">
        {list.map((b) => (
          <div key={b.id} className="card p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-pink-700">{formatDateBR(b.date)}</p>
              <p className="text-sm text-pink-900/70">
                {b.all_day
                  ? "Fechado o dia todo"
                  : `Horário especial: ${b.start_time?.slice(0, 5)} às ${b.end_time?.slice(0, 5)}`}
                {b.note ? ` — ${b.note}` : ""}
              </p>
            </div>
            <button
              onClick={() => removeBlock(b.id)}
              className="text-sm font-semibold text-red-500 hover:underline"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
