import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Card, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/public/cta-section";
import { FadeIn, StaggerContainer, ScaleIn } from "@/components/ui/scroll-animations";
import { Linkedin } from "lucide-react";

const leadership = [
  {
    name: "Rajesh Sharma",
    role: "Founder & CEO",
    bio: "20+ years in investment banking with experience across M&A, capital markets, and strategic advisory. Former Managing Director at a leading global investment bank. IIM Ahmedabad and IIT Delhi alumnus. Has advised on transactions exceeding $5 billion in aggregate value.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Priya Mehta",
    role: "Chief Investment Officer",
    bio: "15+ years experience in private equity and credit markets. Led investments across 50+ companies in manufacturing, infrastructure, and technology sectors. CFA Charterholder with an MBA from ISB Hyderabad.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Amit Kapoor",
    role: "Head of Wealth Management",
    bio: "18+ years managing portfolios for HNIs and family offices. Deep expertise in alternative investments, estate planning, and cross-border structuring. CFP certified with an MBA from IIM Calcutta.",
    image: null,
    linkedin: "https://linkedin.com",
  },
  {
    name: "Sneha Reddy",
    role: "Head of Risk & Compliance",
    bio: "12+ years in risk management and regulatory compliance across asset management and banking. Former regulatory advisor at a Big 4 firm. Company Secretary and LLB from National Law School.",
    image: null,
    linkedin: "https://linkedin.com",
  },
];

const team = [
  { name: "Vikram Singh", role: "Director - Private Credit", linkedin: "https://linkedin.com" },
  { name: "Ananya Gupta", role: "Vice President - Investments", linkedin: "https://linkedin.com" },
  { name: "Rohit Jain", role: "Director - Investor Relations", linkedin: "https://linkedin.com" },
  { name: "Meera Krishnan", role: "Associate Director - Operations", linkedin: "https://linkedin.com" },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FadeIn direction="down" delay={0.1}>
                <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Our Team</p>
              </FadeIn>
              <FadeIn direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
                  Meet the Leadership
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.3}>
                <p className="text-lg text-muted-foreground">
                  A seasoned team of investment professionals with decades of combined experience 
                  across private credit, investment banking, and wealth management.
                </p>
              </FadeIn>
            </div>

            <StaggerContainer stagger={0.12} className="grid md:grid-cols-2 gap-8 mb-20">
              {leadership.map((member, index) => (
                <FadeIn key={index} direction={index % 2 === 0 ? "left" : "right"}>
                  <Card className="overflow-hidden hover-elevate transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <ScaleIn delay={0.1}>
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                            <span className="text-2xl font-serif font-bold text-accent">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </span>
                          </div>
                        </ScaleIn>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                            <div>
                              <h3 className="text-xl font-semibold">{member.name}</h3>
                              <p className="text-accent">{member.role}</p>
                            </div>
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300"
                              data-testid={`link-linkedin-${member.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </StaggerContainer>

            <FadeIn direction="up">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-serif font-bold mb-4">Investment Team</h2>
                <p className="text-muted-foreground">
                  Our experienced professionals driving investment excellence.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <ScaleIn key={index}>
                  <Card className="text-center hover-elevate transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                        <span className="text-lg font-serif font-bold text-accent">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                        data-testid={`link-linkedin-team-${member.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </CardContent>
                  </Card>
                </ScaleIn>
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
