import { Features } from "@/components/landing/Features";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/landing/Navbar";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { Stats } from "@/components/landing/Stats";

export default function Home() {
  return (
    <main className="theme-marketing overflow-hidden">
      <Navbar />
      <Hero />
      <ProductPreview />
      <Stats />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </main>
  );
}
