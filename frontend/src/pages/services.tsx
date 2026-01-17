import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/public/cta-section";
import { Link } from "wouter";
import { FadeIn, StaggerContainer, ScaleIn } from "@/components/ui/scroll-animations";
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  Briefcase,
  Building2,
  Banknote,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const services = [
  {
    icon: Landmark,
    title: "Investment Banking",
    description: "Strategic advisory services for transformative transactions that shape businesses and industries.",
    details: [
      "Mergers & Acquisitions advisory",
      "Capital raising for growth and expansion",
      "Strategic alternatives and restructuring",
      "Valuation and fairness opinions",
      "Cross-border transaction support",
    ],
  },
  {
    icon: PiggyBank,
    title: "Wealth Management",
    description: "Comprehensive wealth solutions designed for HNIs and family offices seeking institutional-grade service.",
    details: [
      "Portfolio construction and management",
      "Alternative investment access",
      "Tax-efficient structuring",
      "Estate and succession planning",
      "Family office advisory",
    ],
  },
  {
    icon: TrendingUp,
    title: "Private Credit",
    description: "Flexible credit solutions that bridge the gap between traditional banking and dynamic business needs.",
    details: [
      "Growth capital facilities",
      "Bridge and mezzanine financing",
      "Working capital solutions",
      "Acquisition financing",
      "Refinancing and restructuring",
    ],
  },
  {
    icon: Briefcase,
    title: "AIF Exposure",
    description: "Curated access to alternative investment funds with professional management and diversified strategies.",
    details: [
      "Category II AIF access",
      "Private equity exposure",
      "Real estate funds",
      "Infrastructure investments",
      "Multi-strategy allocations",
    ],
  },
  {
    icon: Building2,
    title: "Real Estate Finance",
    description: "Structured lending solutions for real estate developers, investors, and special situations.",
    details: [
      "Project and construction financing",
      "Land acquisition loans",
      "Commercial property funding",
      "Residential development finance",
      "Lease rental discounting",
    ],
  },
  {
    icon: Banknote,
    title: "Special Situations",
    description: "Complex transactions and unique financing needs where creative solutions are required.",
    details: [
      "Turnaround and distressed financing",
      "Last-mile funding solutions",
      "Complex structured transactions",
      "Asset monetization",
      "Litigation and regulatory funding",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FadeIn direction="down" delay={0.1}>
                <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Our Services</p>
              </FadeIn>
              <FadeIn direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
                  Comprehensive Financial Solutions
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.3}>
                <p className="text-lg text-muted-foreground">
                  From investment banking to private credit, we offer a full suite of financial services 
                  designed for India's most ambitious companies and investors.
                </p>
              </FadeIn>
            </div>

            <StaggerContainer stagger={0.15} className="space-y-12">
              {services.map((service, index) => (
                <FadeIn key={index} direction={index % 2 === 0 ? "left" : "right"}>
                  <Card className="overflow-hidden hover-elevate transition-all duration-300">
                    <div className="grid lg:grid-cols-2">
                      <CardHeader className="p-8 lg:p-10">
                        <ScaleIn delay={0.1}>
                          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 transition-all duration-300 hover:scale-110 hover:bg-accent group">
                            <service.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
                          </div>
                        </ScaleIn>
                        <CardTitle className="text-2xl font-semibold mb-4">{service.title}</CardTitle>
                        <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                      </CardHeader>
                      <CardContent className="p-8 lg:p-10 bg-muted/30">
                        <h4 className="font-medium mb-4">Key Offerings</h4>
                        <ul className="space-y-3">
                          {service.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href="/contact">
                          <Button className="mt-6 gap-2" variant="outline" data-testid={`button-inquire-${service.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            Inquire Now
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </StaggerContainer>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
