import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Menu, X, User, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import gsap from "gsap";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Velocity Fund", href: "/velocity-fund" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, isLoading, role } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(
        ".nav-item",
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.2,
          ease: "power2.out"
        }
      );

      gsap.fromTo(
        ".header-actions",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: "power3.out" }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMobileMenuOpen
        ? "bg-background/95 backdrop-blur-xl border-b shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 lg:h-20">
          <Link href="/" ref={logoRef} className="flex items-center gap-2 opacity-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm border border-accent/20 transition-transform duration-300 hover:scale-105">
                <span className="text-accent font-serif font-bold text-xl">G</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-tight tracking-tight">Godman</span>
                <span className="text-[10px] text-accent tracking-[0.2em] uppercase font-medium">Capital</span>
              </div>
            </div>
          </Link>

          <nav ref={navRef} className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`nav-item text-sm font-medium opacity-0 transition-all duration-300 ${location === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="header-actions flex items-center gap-2 opacity-0">
            <ThemeToggle />
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Link href={role === "admin" || role === "super_admin" ? "/admin" : "/dashboard"}>
                    <Button data-testid="button-dashboard" className="transition-all duration-300 hover:scale-105">
                      {role === "admin" || role === "super_admin" ? "Admin Panel" : "Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    data-testid="button-login"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Login
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t bg-background/98 backdrop-blur-xl animate-fade-in overflow-y-auto max-h-[calc(100vh-4rem)]">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item, index) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium ${location === item.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground"
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-serif">
              Welcome to Godman Capital
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Please select how you would like to access the platform
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/login"
              className="block"
              onClick={() => setShowLoginDialog(false)}
              data-testid="button-login-investor"
            >
              <div className="flex items-center gap-4 p-4 rounded-lg border hover-elevate cursor-pointer transition-all duration-300 hover:border-accent/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Investor Portal</h3>
                  <p className="text-xs text-muted-foreground">
                    Access your portfolio, statements & reports
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/login"
              className="block"
              onClick={() => setShowLoginDialog(false)}
              data-testid="button-login-admin"
            >
              <div className="flex items-center gap-4 p-4 rounded-lg border hover-elevate cursor-pointer transition-all duration-300 hover:border-accent/50">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Admin Dashboard</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage investors & fund data
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
