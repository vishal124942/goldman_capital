import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "orbital" | "pulse" | "bars" | "dots" | "ring";
  className?: string;
}

export function PremiumLoader({ size = "md", variant = "orbital", className }: PremiumLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (variant === "orbital") {
        gsap.to(".orbital-dot", {
          rotation: 360,
          duration: 1.5,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
          stagger: {
            each: 0.2,
            repeat: -1,
          },
        });
      } else if (variant === "pulse") {
        gsap.to(".pulse-ring", {
          scale: 2,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
          repeat: -1,
          stagger: 0.4,
        });
      } else if (variant === "bars") {
        gsap.to(".bar", {
          scaleY: 1.5,
          duration: 0.4,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          stagger: {
            each: 0.1,
            repeat: -1,
          },
        });
      } else if (variant === "dots") {
        gsap.to(".dot", {
          y: -8,
          duration: 0.3,
          ease: "power2.out",
          yoyo: true,
          repeat: -1,
          stagger: {
            each: 0.15,
            repeat: -1,
          },
        });
      } else if (variant === "ring") {
        gsap.to(".ring-segment", {
          rotation: 360,
          duration: 1,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center", sizeMap[size], className)}
      data-testid="premium-loader"
    >
      {variant === "orbital" && (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
          <div className="orbital-dot absolute w-2 h-2 bg-accent rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="orbital-dot absolute w-1.5 h-1.5 bg-accent/70 rounded-full bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
        </div>
      )}

      {variant === "pulse" && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="pulse-ring absolute w-full h-full border-2 border-accent rounded-full" />
          <div className="pulse-ring absolute w-full h-full border-2 border-accent rounded-full" />
          <div className="pulse-ring absolute w-full h-full border-2 border-accent rounded-full" />
          <div className="w-2 h-2 bg-accent rounded-full" />
        </div>
      )}

      {variant === "bars" && (
        <div className="flex items-center gap-1 h-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bar w-1 h-4 bg-accent rounded-full origin-bottom" />
          ))}
        </div>
      )}

      {variant === "dots" && (
        <div className="flex items-center gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="dot w-2 h-2 bg-accent rounded-full" />
          ))}
        </div>
      )}

      {variant === "ring" && (
        <svg className="w-full h-full" viewBox="0 0 50 50">
          <circle
            className="ring-segment"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="3"
            strokeDasharray="31.4 94.2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

export function PageLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      )
        .fromTo(
          progressRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: "power2.inOut" },
          "-=0.3"
        )
        .to(logoRef.current, {
          scale: 1.1,
          duration: 0.3,
          ease: "power2.in",
        })
        .to(loaderRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
    }, loaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      data-testid="page-loader"
    >
      <div ref={logoRef} className="flex flex-col items-center gap-6">
        <div className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">Godman</span>
          <span className="text-accent"> Capital</span>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-accent origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded-md",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-card border rounded-xl space-y-4">
      <SkeletonShimmer className="h-4 w-1/3" />
      <SkeletonShimmer className="h-8 w-2/3" />
      <SkeletonShimmer className="h-3 w-1/2" />
    </div>
  );
}

export function ChartSkeleton() {
  const heights = [45, 65, 55, 80, 70, 50, 75, 60, 85, 40, 70, 55];
  return (
    <div className="p-6 bg-card border rounded-xl">
      <SkeletonShimmer className="h-5 w-1/4 mb-6" />
      <div className="h-[300px] flex items-end gap-2 pt-8">
        {heights.map((h, i) => (
          <div key={i} className="flex-1" style={{ height: `${h}%` }}>
            <SkeletonShimmer className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="p-4 border-b">
        <SkeletonShimmer className="h-5 w-1/4" />
      </div>
      <div className="divide-y">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <SkeletonShimmer className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonShimmer className="h-4 w-1/3" />
              <SkeletonShimmer className="h-3 w-1/4" />
            </div>
            <SkeletonShimmer className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
