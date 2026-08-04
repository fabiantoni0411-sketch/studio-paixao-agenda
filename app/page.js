import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceList from "@/components/ServiceList";
import Gallery from "@/components/Gallery";

export default function HomePage() {
  return (
    <main>
      <Header />

      <section className="bg-brand-gradient pb-16 pt-4 text-center px-6">
        <p className="uppercase tracking-widest text-pink-900/70 text-sm font-semibold">
          Cílios • Sobrancelhas
        </p>
        <h1 className="font-title text-4xl md:text-5xl text-pink-600 font-bold mt-2">
          Seja muito bem-vindo(a)! 💗
        </h1>
        <p className="text-pink-900/80 mt-3 max-w-md mx-auto">
          É um prazer ter você por aqui. Agende online o seu horário de
          alongamento de cílios ou design de sobrancelha, no seu tempo, sem
          precisar ligar.
        </p>
        <Link href="/agendar" className="btn-primary mt-6">
          Agendar horário
        </Link>
      </section>

      <section className="py-16">
        <ServiceList />
      </section>

      <section className="py-16 bg-pink-50">
        <Gallery />
      </section>

      <Footer />
    </main>
  );
}
