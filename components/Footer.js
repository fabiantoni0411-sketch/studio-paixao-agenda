import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/constants";
import WhatsAppIcon from "./WhatsAppIcon";
import HiddenAdminTrigger from "./HiddenAdminTrigger";

export default function Footer() {
  return (
    <footer className="bg-pink-100 py-10 mt-16">
      <div className="max-w-3xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          <WhatsAppIcon className="w-5 h-5" />
          {WHATSAPP_DISPLAY}
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          {INSTAGRAM_HANDLE}
        </a>
        <HiddenAdminTrigger className="text-xs text-pink-700/70 mt-4 select-none">
          © {new Date().getFullYear()} Studio Paixão — Cílios &amp; Sobrancelhas
        </HiddenAdminTrigger>
        <p className="text-xs text-pink-700/50">Desenvolvido por Faby Bassitii</p>
      </div>
    </footer>
  );
}
