import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Landmark, PiggyBank, TrendingUp, Briefcase, Building2, Banknote } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Landmark,
    title: "Investment Banking",
    description: "Strategic advisory services for M&A, capital raising, and complex financial transactions. We help companies navigate critical growth moments.",
    features: ["Mergers & Acquisitions", "Capital Raising", "Strategic Advisory"],
  },
  {
    icon: PiggyBank,
    title: "Wealth Management",
    description: "Bespoke wealth solutions for HNIs and family offices. Preserve and grow your wealth with institutional-grade strategies.",
    features: ["Portfolio Management", "Estate Planning", "Tax Optimization"],
  },
  {
    icon: TrendingUp,
    title: "Private Credit",
    description: "Flexible credit solutions for scaling businesses. From growth capital to bridge financing, designed for speed and precision.",
    features: ["Growth Capital", "Bridge Financing", "Working Capital"],
  },
  {
    icon: Briefcase,
    title: "AIF Exposure",
    description: "Access to alternative investment funds with curated exposure to high-growth opportunities across sectors.",
    features: ["Category II AIFs", "Diversified Exposure", "Professional Management"],
  },
  {
    icon: Building2,
    title: "Real Estate Finance",
    description: "Structured lending solutions for real estate developers and investors. Funding for acquisition, development, and refinancing.",
    features: ["Project Finance", "Construction Loans", "Refinancing"],
  },
  {
    icon: Banknote,
    title: "Special Situations",
    description: "Complex transactions and unique financing needs where traditional lenders cannot deliver solutions. We fund what others fear.",
    features: ["Turnaround Financing", "Distressed Assets", "Complex Structures"],
  },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".services-label",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".services-title",
        { opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.8,
          delay: 0.1,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".services-description",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".service-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: {
            each: 0.1,
            from: "start",
          },
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".services-cta",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: ".services-cta",
            start: "top 90%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <p className="services-label text-sm font-medium text-accent mb-4 uppercase tracking-wider opacity-0">
            Our Capabilities
          </p>
          <h2 className="services-title text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6 opacity-0">
            Capital That Works For You
          </h2>
          <p className="services-description text-lg text-muted-foreground opacity-0">
            From growth capital to complex transactions, our structured solutions are designed 
            to accelerate your business objectives with speed and precision.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="service-card group hover-elevate transition-all duration-300 bg-card opacity-0"
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <service.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/services">
                  <Button
                    variant="ghost"
                    className="gap-2 px-0 text-accent"
                    data-testid={`button-learn-more-${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="services-cta text-center mt-12 opacity-0">
          <Link href="/services">
            <Button size="lg" className="gap-2 group" data-testid="button-explore-all-services">
              Explore All Services
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
