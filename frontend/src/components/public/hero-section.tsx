import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedCounter } from "@/components/ui/animated-text";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 500, suffix: "+ Cr", label: "Assets Under Management", icon: TrendingUp, prefix: "₹" },
  { value: 12, suffix: "+", label: "Years Experience", icon: Shield },
  { value: 50, suffix: "+", label: "Institutional Clients", icon: Users },
  { value: 24, suffix: "%", label: "Avg. Returns", icon: Zap },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          ".hero-title span",
          { opacity: 0, y: 40, rotateX: -30 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.1 },
          "-=0.3"
        )
        .fromTo(
          ".hero-description",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ".hero-buttons",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.4"
        )
        .fromTo(
          ".hero-trust",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        );

      gsap.fromTo(
        chartRef.current,
        { opacity: 0, x: 50, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          delay: 0.5,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".chart-bar",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          stagger: 0.05,
          delay: 0.8,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".stat-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={heroContentRef} className="space-y-8">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium opacity-0">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              India's Next-Gen Private Credit Platform
            </div>
            
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight" style={{ perspective: "1000px" }}>
              <span className="inline-block opacity-0">Precision Capital for</span>{" "}
              <span className="inline-block text-accent opacity-0">Visionary</span>{" "}
              <span className="inline-block opacity-0">Companies</span>
            </h1>
            
            <p className="hero-description text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl opacity-0">
              Strategic, high-impact financial solutions for India's rising market leaders. 
              We blend speed, structure, and sophistication to fund companies where traditional capital falls short.
            </p>
            
            <div className="hero-buttons flex flex-wrap gap-4 opacity-0">
              <Link href="/contact">
                <Button size="lg" className="gap-2 group" data-testid="button-book-call">
                  Book a Call
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/velocity-fund">
                <Button size="lg" variant="outline" data-testid="button-request-deck">
                  Request Deck
                </Button>
              </Link>
            </div>
            
            <div className="hero-trust pt-8 border-t opacity-0">
              <p className="text-sm text-muted-foreground mb-4">Trusted by leading institutions</p>
              <div className="flex items-center gap-8">
                <div className="text-2xl font-serif font-bold text-muted-foreground/30">SEBI Registered</div>
                <div className="text-2xl font-serif font-bold text-muted-foreground/30">ISO Certified</div>
              </div>
            </div>
          </div>
          
          <div ref={chartRef} className="relative opacity-0">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-50 animate-pulse-glow" />
            <div className="relative bg-card rounded-2xl border shadow-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Performance Overview</h3>
                <span className="text-sm text-muted-foreground">FY 2024-25</span>
              </div>
              
              <div ref={barsRef} className="h-48 bg-gradient-to-t from-accent/20 to-transparent rounded-lg flex items-end justify-between p-4 gap-2">
                {[65, 45, 78, 56, 89, 72, 95, 68, 82, 90, 75, 88].map((height, i) => (
                  <div
                    key={i}
                    className="chart-bar flex-1 bg-gradient-to-t from-accent to-accent/60 rounded-t-sm origin-bottom"
                    style={{ height: `${height}%`, transform: "scaleY(0)" }}
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={523} prefix="₹" suffix=" Cr" trigger={false} />
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">+18.5% YoY</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Net IRR</p>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter value={24.8} suffix="%" decimals={1} trigger={false} />
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">+2.3% QoQ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card p-6 rounded-xl bg-card border hover-elevate transition-all duration-300 opacity-0 group"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-accent group-hover:scale-110">
                <stat.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <p className="text-3xl font-bold mb-1">
                <AnimatedCounter 
                  value={stat.value} 
                  prefix={stat.prefix || ""} 
                  suffix={stat.suffix} 
                />
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
