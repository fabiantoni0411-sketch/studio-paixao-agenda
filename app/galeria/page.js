import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";

export default function GaleriaPage() {
  return (
    <main>
      <Header />
      <section className="py-16">
        <Gallery />
      </section>
      <Footer />
    </main>
  );
}
