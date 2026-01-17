import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FadeIn, StaggerContainer, ScaleIn, Parallax } from "@/components/ui/scroll-animations";
import {
  Shield,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  Target,
  BarChart3,
} from "lucide-react";

const fundStats = [
  { label: "Target Returns", value: "18-24%", sublabel: "Net IRR p.a." },
  { label: "Fund Size", value: "₹500 Cr", sublabel: "Target corpus" },
  { label: "Min Investment", value: "₹1 Cr", sublabel: "Eligibility" },
  { label: "Tenure", value: "5 Years", sublabel: "Investment horizon" },
];

const investmentStrategy = [
  {
    icon: TrendingUp,
    title: "Private Credit",
    allocation: "60-70%",
    description: "Senior secured lending to mid-market companies with strong cash flows",
  },
  {
    icon: PieChart,
    title: "AIF Exposure",
    allocation: "20-30%",
    description: "Diversified allocation to top-tier alternative investment funds",
  },
  {
    icon: Shield,
    title: "Cash & Equivalents",
    allocation: "5-15%",
    description: "Liquidity buffer for opportunistic deployments and distributions",
  },
];

const highlights = [
  "SEBI Registered Category II AIF",
  "Quarterly NAV and performance reports",
  "Dedicated relationship manager",
  "Transparent fee structure (2/20)",
  "Institutional-grade due diligence",
  "Independent custody and administration",
  "Regular investor communications",
  "Tax-efficient fund structure",
];

export default function VelocityFundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8">
                <FadeIn direction="down" delay={0.1}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    SEBI Registered AIF
                  </div>
                </FadeIn>
                
                <FadeIn direction="up" delay={0.2}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                    Velocity Fund
                  </h1>
                </FadeIn>
                
                <FadeIn direction="up" delay={0.3}>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Our flagship alternative investment fund offering institutional investors access to 
                    high-quality private credit opportunities across India's growth sectors.
                  </p>
                </FadeIn>
                
                <FadeIn direction="up" delay={0.4}>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/contact">
                      <Button size="lg" className="gap-2" data-testid="button-invest-now">
                        Request Information
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" data-testid="button-download-deck">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Deck
                    </Button>
                  </div>
                </FadeIn>
              </div>
              
              <StaggerContainer stagger={0.1} className="grid grid-cols-2 gap-4">
                {fundStats.map((stat, index) => (
                  <ScaleIn key={index}>
                    <Card className="bg-card hover-elevate transition-all duration-300">
                      <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-accent">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                      </CardContent>
                    </Card>
                  </ScaleIn>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FadeIn direction="up">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">Investment Strategy</h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="text-lg text-muted-foreground">
                  A balanced approach combining private credit exposure with alternative investments 
                  for consistent risk-adjusted returns.
                </p>
              </FadeIn>
            </div>

            <StaggerContainer stagger={0.15} className="grid md:grid-cols-3 gap-6">
              {investmentStrategy.map((item, index) => (
                <ScaleIn key={index}>
                  <Card className="bg-card hover-elevate transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-accent group">
                        <item.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <span className="text-2xl font-bold text-accent">{item.allocation}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </ScaleIn>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <FadeIn direction="left">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-8">Fund Highlights</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn direction="right">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle>Fund Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-3 border-b flex-wrap gap-2">
                      <span className="text-muted-foreground">Fund Manager</span>
                      <span className="font-medium">Godman Capital Asset Management</span>
                    </div>
                    <div className="flex justify-between py-3 border-b flex-wrap gap-2">
                      <span className="text-muted-foreground">Fund Structure</span>
                      <span className="font-medium">Close-ended AIF</span>
                    </div>
                    <div className="flex justify-between py-3 border-b flex-wrap gap-2">
                      <span className="text-muted-foreground">Investment Manager Fee</span>
                      <span className="font-medium">2% p.a.</span>
                    </div>
                    <div className="flex justify-between py-3 border-b flex-wrap gap-2">
                      <span className="text-muted-foreground">Performance Fee</span>
                      <span className="font-medium">20% above hurdle</span>
                    </div>
                    <div className="flex justify-between py-3 border-b flex-wrap gap-2">
                      <span className="text-muted-foreground">Hurdle Rate</span>
                      <span className="font-medium">8% p.a.</span>
                    </div>
                    <div className="flex justify-between py-3 flex-wrap gap-2">
                      <span className="text-muted-foreground">SEBI Registration</span>
                      <span className="font-medium">INP000XXXXX</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </section>

        <Parallax speed={0.1}>
          <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <FadeIn direction="up">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
                  Ready to Invest?
                </h2>
              </FadeIn>
              <FadeIn direction="up" delay={0.1}>
                <p className="text-lg text-primary-foreground/80 mb-8">
                  Connect with our team to learn more about Velocity Fund and how it fits your investment objectives.
                </p>
              </FadeIn>
              <FadeIn direction="up" delay={0.2}>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90" data-testid="button-schedule-call">
                      <Users className="w-4 h-4" />
                      Schedule a Call
                    </Button>
                  </Link>
                  <a href="/api/login">
                    <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-investor-login-fund">
                      Investor Login
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </FadeIn>
            </div>
          </section>
        </Parallax>
      </main>
      <Footer />
    </div>
  );
}
