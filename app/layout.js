import "./globals.css";
import { Playfair_Display, Poppins } from "next/font/google";

const titleFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-title",
});

const bodyFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "Studio Paixão | Cílios & Sobrancelhas",
  description:
    "Agende seu horário de alongamento de cílios e design de sobrancelha com o Studio Paixão.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body className="font-body text-pink-900 bg-pink-50">{children}</body>
    </html>
  );
}
