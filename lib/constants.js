export const WHATSAPP_NUMBER = "5511978319614"; // (11) 97831-9614
export const WHATSAPP_DISPLAY = "(11) 97831-9614";
export const INSTAGRAM_HANDLE = "@studio_paixaoo";
export const INSTAGRAM_URL = "https://instagram.com/studio_paixaoo";

export const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function formatBRL(value) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateBR(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function phoneToAdminEmail(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  return `${digits}@studiopaixao.local`;
}

export const PAYMENT_METHODS = ["Pix", "Débito", "Crédito"];
