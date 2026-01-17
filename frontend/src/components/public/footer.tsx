import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Team", href: "/team" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Investment Banking", href: "/services" },
    { label: "Wealth Management", href: "/services" },
    { label: "Private Credit", href: "/services" },
    { label: "Velocity Fund", href: "/velocity-fund" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclosures", href: "/disclosures" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[hsl(220,55%,12%)] text-white dark:bg-[hsl(220,55%,6%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[hsl(45,100%,50%)] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-[hsl(220,55%,12%)] font-serif font-bold text-xl">G</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-tight tracking-tight text-white">Godman</span>
                <span className="text-[10px] text-[hsl(45,100%,50%)] tracking-[0.2em] uppercase font-medium">Capital</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              India's next-generation private credit platform delivering strategic, high-impact financial solutions for visionary companies.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(45,100%,50%)] hover:text-[hsl(220,55%,12%)] transition-all duration-300"
                data-testid="link-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(45,100%,50%)] hover:text-[hsl(220,55%,12%)] transition-all duration-300"
                data-testid="link-twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-[hsl(45,100%,50%)] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <Link href={link.href}>
                    <span className="text-sm text-white/60 hover:text-[hsl(45,100%,50%)] transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-white/40" />
                <span className="text-sm text-white/60">
                  Mumbai, Maharashtra<br />India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/40" />
                <a href="mailto:info@godmancapital.in" className="text-sm text-white/60 hover:text-[hsl(45,100%,50%)] transition-colors">
                  info@godmancapital.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-white/40" />
                <a href="tel:+919876543210" className="text-sm text-white/60 hover:text-[hsl(45,100%,50%)] transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50">
              {new Date().getFullYear()} Godman Capital. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/login"
                className="text-xs text-white/50 hover:text-[hsl(45,100%,50%)] transition-colors"
                data-testid="link-investor-login"
              >
                Investor Login
              </Link>
              <Link 
                href="/login"
                className="text-xs text-white/50 hover:text-[hsl(45,100%,50%)] transition-colors"
                data-testid="link-admin-login"
              >
                Admin Login
              </Link>
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="text-xs text-white/50 hover:text-[hsl(45,100%,50%)] transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30 mt-4 text-center md:text-left max-w-4xl">
            Investment in securities market are subject to market risks. Read all related documents carefully before investing. 
            Past performance is not indicative of future returns. Godman Capital is a registered investment advisor with SEBI.
          </p>
        </div>
      </div>
    </footer>
  );
}
