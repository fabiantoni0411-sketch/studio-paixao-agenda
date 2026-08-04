// Todas as funções trabalham com strings "HH:MM" (24h)

export function toMinutes(hhmm) {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.round(mins % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Gera os horários disponíveis dentro de uma janela de trabalho, dada a duração
 * do serviço e os horários já ocupados naquele dia.
 */
export function generateSlots(
  workStart,
  workEnd,
  durationMinutes,
  bookedRanges = [],
  stepMinutes = 15,
  nowMinutes = null
) {
  const start = toMinutes(workStart);
  const end = toMinutes(workEnd);
  const slots = [];

  for (let t = start; t + durationMinutes <= end; t += stepMinutes) {
    if (nowMinutes !== null && t < nowMinutes) continue;

    const slotStart = t;
    const slotEnd = t + durationMinutes;

    const overlaps = bookedRanges.some((b) => {
      const bs = toMinutes(b.start);
      const be = toMinutes(b.end);
      return slotStart < be && bs < slotEnd;
    });

    if (!overlaps) {
      slots.push(toHHMM(slotStart));
    }
  }

  return slots;
}
