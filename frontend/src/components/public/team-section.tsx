import { Card, CardContent } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const teamMembers = [
  {
    name: "Rajesh Sharma",
    role: "Founder & CEO",
    bio: "20+ years in investment banking. Former MD at leading global investment bank. IIM Ahmedabad alumnus.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Priya Mehta",
    role: "Chief Investment Officer",
    bio: "15+ years in private equity and credit markets. Led investments across 50+ companies. CFA Charterholder.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Amit Kapoor",
    role: "Head of Wealth Management",
    bio: "18+ years managing HNI portfolios. Expertise in alternative investments and estate planning. CFP certified.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Sneha Reddy",
    role: "Head of Risk & Compliance",
    bio: "12+ years in risk management and regulatory compliance. Former regulatory advisor. Company Secretary.",
    image: null,
    linkedin: "https://linkedin.com",
  },
];

export function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-label",
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
        ".team-title",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.1,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".team-description",
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
        ".team-card",
        { opacity: 0, y: 50, rotateY: 10 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".team-avatar",
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <p className="team-label text-sm font-medium text-accent mb-4 uppercase tracking-wider opacity-0">
            Leadership
          </p>
          <h2 className="team-title text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6 opacity-0">
            Meet Our Team
          </h2>
          <p className="team-description text-lg text-muted-foreground opacity-0">
            A seasoned team of investment professionals with decades of combined experience 
            across private credit, investment banking, and wealth management.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: "1000px" }}>
          {teamMembers.map((member, index) => (
            <Card key={index} className="team-card group hover-elevate transition-all duration-300 opacity-0">
              <CardContent className="p-6 text-center">
                <div className="team-avatar w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center opacity-0 group-hover:from-accent/30 group-hover:to-primary/30 transition-all duration-300">
                  <span className="text-3xl font-serif font-bold text-accent">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-sm text-accent mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {member.bio}
                </p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-accent hover:scale-110 transition-all duration-300 group/link"
                  data-testid={`link-linkedin-${member.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Linkedin className="w-4 h-4 group-hover/link:text-accent-foreground transition-colors" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
