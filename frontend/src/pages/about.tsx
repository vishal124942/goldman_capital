import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { AboutSection } from "@/components/public/about-section";
import { CTASection } from "@/components/public/cta-section";
import { FadeIn, StaggerContainer, ScaleIn } from "@/components/ui/scroll-animations";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <FadeIn direction="down" delay={0.1}>
              <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Who We Are</p>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">About Godman Capital</h1>
            </FadeIn>
            <FadeIn direction="up" delay={0.3}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Redefining private capital for India's boldest businesses since 2012.
              </p>
            </FadeIn>
          </div>
        </div>
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
