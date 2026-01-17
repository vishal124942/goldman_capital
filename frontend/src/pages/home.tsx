import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { HeroSection } from "@/components/public/hero-section";
import { ServicesSection } from "@/components/public/services-section";
import { VelocityFundSection } from "@/components/public/velocity-fund-section";
import { TeamSection } from "@/components/public/team-section";
import { CTASection } from "@/components/public/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <VelocityFundSection />
        <TeamSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
