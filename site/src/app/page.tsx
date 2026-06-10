import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProviderGrid from "@/components/landing/ProviderGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import VerticalTools from "@/components/landing/VerticalTools";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProviderGrid />
      <HowItWorks />
      <VerticalTools />
      <FAQ />
      <Footer />
    </main>
  );
}
