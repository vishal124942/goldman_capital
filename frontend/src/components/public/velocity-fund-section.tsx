import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, PieChart, Clock, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedCounter } from "@/components/ui/animated-text";

gsap.registerPlugin(ScrollTrigger);

const fundFeatures = [
  {
    icon: TrendingUp,
    title: "Target Returns",
    value: "18-24",
    suffix: "%",
    description: "Net IRR p.a.",
  },
  {
    icon: Shield,
    title: "Risk Profile",
    value: "Moderate",
    isText: true,
    description: "Asset-backed",
  },
  {
    icon: PieChart,
    title: "Diversification",
    value: "Multi-sector",
    isText: true,
    description: "Balanced exposure",
  },
  {
    icon: Clock,
    title: "Investment Horizon",
    value: "3-5",
    suffix: " Years",
    description: "Long-term growth",
  },
];

const highlights = [
  "SEBI Registered Category II AIF",
  "Quarterly performance reports",
  "Dedicated relationship manager",
  "Transparent fee structure",
  "Professional fund management",
  "Institutional-grade due diligence",
];

export function VelocityFundSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".vf-badge",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".vf-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".vf-description",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".vf-feature-card",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".vf-buttons",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.5,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: 50, rotateY: 5 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".highlight-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.3,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={contentRef} className="space-y-8">
            <div className="vf-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium opacity-0">
              <Shield className="w-4 h-4" />
              SEBI Registered AIF
            </div>
            
            <h2 className="vf-title text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight opacity-0">
              Velocity Fund
            </h2>
            
            <p className="vf-description text-lg text-muted-foreground leading-relaxed opacity-0">
              Our flagship alternative investment fund offering institutional investors access to 
              high-quality private credit opportunities. Designed for sophisticated investors 
              seeking consistent, risk-adjusted returns.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {fundFeatures.map((feature, index) => (
                <Card key={index} className="vf-feature-card bg-muted/50 opacity-0 group hover-elevate transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <p className="text-2xl font-bold">
                      {feature.isText ? (
                        feature.value
                      ) : (
                        <>{feature.value}{feature.suffix}</>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="vf-buttons flex flex-wrap gap-4 opacity-0">
              <Link href="/velocity-fund">
                <Button size="lg" className="gap-2 group" data-testid="button-learn-more-velocity">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" data-testid="button-request-information">
                  Request Information
                </Button>
              </Link>
            </div>
          </div>
          
          <div ref={cardRef} className="relative opacity-0" style={{ perspective: "1000px" }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-3xl blur-2xl animate-pulse" />
            <Card className="relative bg-card">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Fund Highlights</h3>
                  <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium animate-pulse">
                    Open for Investment
                  </span>
                </div>
                
                <div className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="highlight-item flex items-center gap-3 opacity-0 p-2 rounded-lg hover:bg-muted/50 transition-colors group/highlight">
                      <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover/highlight:bg-green-500 group-hover/highlight:scale-110 transition-all duration-300">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 group-hover/highlight:text-white transition-colors" />
                      </div>
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Minimum Investment</p>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter value={1} prefix="₹" suffix=" Crore" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Subject to eligibility criteria</p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Fund Manager</p>
                  <p className="font-semibold">Godman Capital Asset Management</p>
                  <p className="text-xs text-muted-foreground">SEBI Reg. No: INP000XXXXX</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
