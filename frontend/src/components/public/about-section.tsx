import { Target, Eye, Gem } from "lucide-react";
import { FadeIn, StaggerContainer, ScaleIn } from "@/components/ui/scroll-animations";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To democratize access to institutional-grade private credit opportunities for India's high-growth companies and sophisticated investors.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "To be India's most trusted private credit platform, known for speed, transparency, and exceptional risk-adjusted returns.",
  },
  {
    icon: Gem,
    title: "Our Values",
    description: "Integrity, excellence, and client-centricity guide everything we do. We build lasting partnerships based on trust and results.",
  },
];

const milestones = [
  { year: "2012", event: "Godman Capital founded in Mumbai" },
  { year: "2015", event: "SEBI registration for investment advisory" },
  { year: "2018", event: "Crossed ₹100 Cr AUM milestone" },
  { year: "2020", event: "Launched Velocity Fund - Category II AIF" },
  { year: "2023", event: "Expanded to 50+ institutional clients" },
  { year: "2024", event: "Crossed ₹500 Cr AUM" },
];

export function AboutSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <FadeIn direction="left">
            <div className="space-y-6">
              <p className="text-sm font-medium text-accent uppercase tracking-wider">About Us</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                We Fund What Others Fear
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Godman Capital is a next-generation private credit platform delivering strategic, 
                high-impact financial solutions for India's rising market leaders. Founded in 2012, 
                we have built a reputation for speed, structure, and sophistication.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our approach is different: we don't just provide capital, we architect financial 
                solutions that accelerate your vision. From rapid deployment to flexible structures, 
                we understand that exceptional businesses require exceptional capital partners.
              </p>
            </div>
          </FadeIn>
          
          <FadeIn direction="right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-3xl blur-2xl" />
              <StaggerContainer stagger={0.12} className="relative grid gap-6">
                {values.map((value, index) => (
                  <ScaleIn key={index}>
                    <div className="flex gap-4 p-6 rounded-xl bg-card border hover-elevate transition-all duration-300">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-accent hover:scale-110 group">
                        <value.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{value.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </ScaleIn>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>
        </div>

        <FadeIn direction="up">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-serif font-bold mb-4">Our Journey</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Over a decade of building trust, delivering results, and empowering India's boldest businesses.
            </p>
          </div>
        </FadeIn>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
          <StaggerContainer stagger={0.1} className="space-y-8">
            {milestones.map((milestone, index) => (
              <FadeIn key={index} direction={index % 2 === 0 ? "left" : "right"}>
                <div className={`flex items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="inline-block p-4 rounded-lg bg-card border hover-elevate transition-all duration-300">
                      <p className="text-accent font-bold text-lg">{milestone.year}</p>
                      <p className="text-sm text-muted-foreground">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-accent border-4 border-background transition-transform duration-300 hover:scale-150" />
                  <div className="flex-1" />
                </div>
              </FadeIn>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
