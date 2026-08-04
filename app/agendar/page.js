import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/BookingWizard";

export default function AgendarPage() {
  return (
    <main>
      <Header />
      <section className="py-12">
        <BookingWizard />
      </section>
      <Footer />
    </main>
  );
}
