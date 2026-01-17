import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-title",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".cta-description",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".cta-button",
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.4,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".cta-quote",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="cta-title text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-6 max-w-3xl mx-auto leading-tight opacity-0">
          Ready to Access Precision Capital?
        </h2>
        <p className="cta-description text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto opacity-0">
          Join India's most ambitious companies who partner with Godman Capital for speed, 
          structure, and sophisticated financing solutions that traditional lenders can't match.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact">
            <Button
              size="lg"
              className="cta-button gap-2 bg-accent text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group"
              data-testid="button-cta-book-call"
            >
              <Phone className="w-4 h-4 group-hover:animate-pulse" />
              Book a Call
            </Button>
          </Link>
          <Link href="/services">
            <Button
              size="lg"
              variant="outline"
              className="cta-button gap-2 border-primary-foreground/30 text-primary-foreground opacity-0 group"
              data-testid="button-cta-explore"
            >
              Explore Capabilities
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <div className="cta-quote mt-12 pt-8 border-t border-primary-foreground/20 opacity-0">
          <p className="text-sm text-primary-foreground/60 italic">
            "We fund what others fear. Speed, structure, and clarity for India's boldest businesses."
          </p>
        </div>
      </div>
    </section>
  );
}
