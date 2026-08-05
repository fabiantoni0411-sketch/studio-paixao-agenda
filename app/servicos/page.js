import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceList from "@/components/ServiceList";

export default function ServicosPage() {
  return (
    <main>
      <Header />
      <section className="py-16">
        <ServiceList />
      </section>
      <Footer />
    </main>
  );
}
