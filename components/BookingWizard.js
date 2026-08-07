"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateSlots } from "@/lib/slots";
import { formatBRL, formatDateBR, WHATSAPP_NUMBER, PAYMENT_METHODS } from "@/lib/constants";

const STEPS = ["servico", "data", "horario", "dados", "confirmado"];

export default function BookingWizard() {
  const [step, setStep] = useState("servico");
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingType, setBookingType] = useState("aplicacao");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setServices(data || []);
    }
    loadServices();
  }, []);

  function currentPrice() {
    if (!selectedService) return 0;
    return bookingType === "manutencao" && selectedService.price_maintenance
      ? selectedService.price_maintenance
      : selectedService.price_application;
  }

  async function loadSlotsForDate(chosenDate) {
    setSlotsLoading(true);
    setSlotsMessage("");
    setSlots([]);
    setSelectedSlot(null);

    const weekday = new Date(chosenDate + "T12:00:00").getDay();

    const { data: whList } = await supabase
      .from("working_hours")
      .select("*")
      .eq("weekday", weekday)
      .eq("active", true)
      .order("start_time", { ascending: true });

    const { data: blocked } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("date", chosenDate)
      .maybeSingle();

    if (blocked && blocked.all_day) {
      setSlotsMessage(blocked.note || "Não haverá atendimento nesse dia.");
      setSlotsLoading(false);
      return;
    }

    let windows = [];
    if (blocked && !blocked.all_day && blocked.start_time && blocked.end_time) {
      windows = [
        { start: blocked.start_time.slice(0, 5), end: blocked.end_time.slice(0, 5) },
      ];
    } else if (whList && whList.length > 0) {
      windows = whList.map((w) => ({
        start: w.start_time.slice(0, 5),
        end: w.end_time.slice(0, 5),
      }));
    }

    if (windows.length === 0) {
      setSlotsMessage("Não há atendimento nesse dia.");
      setSlotsLoading(false);
      return;
    }

    const { data: booked } = await supabase.rpc("get_booked_slots", {
      p_date: chosenDate,
    });

    const bookedRanges = (booked || []).map((b) => ({
      start: b.start_time.slice(0, 5),
      end: b.end_time.slice(0, 5),
    }));

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowMinutes =
      chosenDate === todayStr
        ? new Date().getHours() * 60 + new Date().getMinutes()
        : null;

    let available = [];
    for (const w of windows) {
      const slotsForWindow = generateSlots(
        w.start,
        w.end,
        selectedService.duration_minutes,
        bookedRanges,
        15,
        nowMinutes
      );
      available = available.concat(slotsForWindow);
    }
    available = Array.from(new Set(available)).sort();

    if (available.length === 0) {
      setSlotsMessage("Não há mais horários livres nesse dia. Tente outra data.");
    }

    setSlots(available);
    setSlotsLoading(false);
  }

  async function handlePickDate(e) {
    const value = e.target.value;
    setDate(value);
    if (value) await loadSlotsForDate(value);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setErrorMsg("");

    const endMinutes =
      toMinutesLocal(selectedSlot) + selectedService.duration_minutes;
    const endTime = toHHMMLocal(endMinutes);

    const { data, error } = await supabase.rpc("create_booking", {
      p_service_id: selectedService.id,
      p_service_name: selectedService.name,
      p_booking_type: bookingType,
      p_price: currentPrice(),
      p_client_name: clientName,
      p_client_phone: clientPhone,
      p_date: date,
      p_start_time: selectedSlot,
      p_end_time: endTime,
      p_payment_method: paymentMethod,
    });

    setSubmitting(false);

    if (error) {
      if (error.message?.includes("HORARIO_INDISPONIVEL")) {
        setErrorMsg(
          "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário."
        );
        await loadSlotsForDate(date);
        setStep("horario");
      } else {
        setErrorMsg("Não foi possível concluir o agendamento. Tente novamente.");
      }
      return;
    }

    setBookingResult({ id: data, endTime });
    setStep("confirmado");
  }

  function whatsappMessage() {
    const tipo = bookingType === "manutencao" ? "Manutenção" : "Aplicação";
    const text =
      `Olá! Meu agendamento no Studio Paixão 💗\n\n` +
      `Cliente: ${clientName}\n` +
      `Serviço: ${selectedService?.name} (${tipo})\n` +
      `Data: ${formatDateBR(date)}\n` +
      `Horário: ${selectedSlot}\n` +
      `Valor: ${formatBRL(currentPrice())}\n` +
      `Forma de pagamento: ${paymentMethod}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  return (
    <div className="max-w-md mx-auto px-6">
      <StepIndicator step={step} />

      {step === "servico" && (
        <div className="space-y-3">
          <h2 className="font-title text-2xl text-pink-600 font-bold mb-4 text-center">
            Escolha o serviço
          </h2>
          {services.map((s) => {
            const isSelected = selectedService?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedService(s);
                  setBookingType("aplicacao");
                }}
                className={`w-full text-left card p-4 border-2 transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-pink-500 bg-pink-100"
                    : "border-transparent"
                }`}
              >
                <div>
                  <p className="font-bold text-pink-600">{s.name}</p>
                  <p className="text-sm text-pink-900/70">
                    Aplicação {formatBRL(s.price_application)}
                    {s.price_maintenance
                      ? ` · Manutenção ${formatBRL(s.price_maintenance)}`
                      : ""}
                  </p>
                </div>
                {isSelected && (
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}

          {selectedService?.price_maintenance ? (
            <div className="flex gap-3 pt-2">
              <TypeButton
                label="Aplicação"
                active={bookingType === "aplicacao"}
                onClick={() => setBookingType("aplicacao")}
              />
              <TypeButton
                label="Manutenção"
                active={bookingType === "manutencao"}
                onClick={() => setBookingType("manutencao")}
              />
            </div>
          ) : null}

          {selectedService && (
            <p className="text-center text-sm font-semibold text-pink-700 bg-pink-50 rounded-xl py-2 px-3">
              Selecionado: {selectedService.name}
              {selectedService.price_maintenance
                ? ` · ${bookingType === "manutencao" ? "Manutenção" : "Aplicação"}`
                : ""}
            </p>
          )}

          <button
            disabled={!selectedService}
            onClick={() => setStep("data")}
            className="btn-primary w-full mt-4"
          >
            Continuar
          </button>
        </div>
      )}

      {step === "data" && (
        <div className="space-y-4">
          <h2 className="font-title text-2xl text-pink-600 font-bold text-center">
            Escolha a data
          </h2>
          <input
            type="date"
            className="input"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={handlePickDate}
          />
          {slotsLoading && <p className="text-center text-pink-700">Buscando horários...</p>}
          {slotsMessage && <p className="text-center text-pink-700">{slotsMessage}</p>}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep("servico")} className="btn-outline">
              Voltar
            </button>
            <button
              disabled={!date || slots.length === 0}
              onClick={() => setStep("horario")}
              className="btn-primary"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "horario" && (
        <div className="space-y-4">
          <h2 className="font-title text-2xl text-pink-600 font-bold text-center">
            Escolha o horário
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={`py-2 rounded-xl border-2 font-semibold ${
                  selectedSlot === s
                    ? "border-pink-500 bg-pink-100 text-pink-700"
                    : "border-pink-200 text-pink-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep("data")} className="btn-outline">
              Voltar
            </button>
            <button
              disabled={!selectedSlot}
              onClick={() => setStep("dados")}
              className="btn-primary"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "dados" && (
        <div className="space-y-4">
          <h2 className="font-title text-2xl text-pink-600 font-bold text-center">
            Seus dados
          </h2>
          <div className="card p-4">
            <p className="font-bold text-pink-600">{selectedService?.name}</p>
            <p className="text-sm text-pink-900/70">
              {formatDateBR(date)} às {selectedSlot} · {formatBRL(currentPrice())}
            </p>
          </div>
          <input
            type="text"
            placeholder="Seu nome"
            className="input"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Seu WhatsApp (com DDD)"
            className="input"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />

          <div>
            <p className="text-sm font-semibold text-pink-700 mb-2">
              Forma de pagamento
            </p>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-2 rounded-xl border-2 font-semibold text-sm ${
                    paymentMethod === m
                      ? "border-pink-500 bg-pink-100 text-pink-700"
                      : "border-pink-200 text-pink-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep("horario")} className="btn-outline">
              Voltar
            </button>
            <button
              disabled={!clientName || !clientPhone || !paymentMethod || submitting}
              onClick={handleConfirm}
              className="btn-primary"
            >
              {submitting ? "Enviando..." : "Enviar agendamento"}
            </button>
          </div>
        </div>
      )}

      {step === "confirmado" && (
        <div className="space-y-4 text-center">
          <h2 className="font-title text-2xl text-pink-600 font-bold">
            Recebemos seu agendamento! 💕
          </h2>
          <p className="text-pink-900/80">
            {selectedService?.name} — {formatDateBR(date)} às {selectedSlot}
          </p>
          <p className="text-pink-900/80">
            Ele está reservado e aguardando nossa confirmação. Pedimos a
            gentileza de encaminhar o resumo abaixo para o WhatsApp do
            estúdio — assim a gente confirma tudo certinho com você:
          </p>
          <a href={whatsappMessage()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
            Enviar resumo pelo WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

function TypeButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl border-2 font-semibold ${
        active ? "border-pink-500 bg-pink-100 text-pink-700" : "border-pink-200 text-pink-700"
      }`}
    >
      {label}
    </button>
  );
}

function StepIndicator({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex justify-center gap-2 mb-8">
      {STEPS.slice(0, 4).map((s, i) => (
        <div
          key={s}
          className={`h-2 w-8 rounded-full ${i <= idx ? "bg-pink-500" : "bg-pink-200"}`}
        />
      ))}
    </div>
  );
}

function toMinutesLocal(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMMLocal(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = Math.round(mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
