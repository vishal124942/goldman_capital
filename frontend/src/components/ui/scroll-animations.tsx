import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
}

export function FadeIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 40,
  threshold = 0.85,
}: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || prefersReducedMotion()) return;

    const directionMap = {
      up: { y: distance, x: 0 },
      down: { y: -distance, x: 0 },
      left: { x: distance, y: 0 },
      right: { x: -distance, y: 0 },
      none: { x: 0, y: 0 },
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        {
          opacity: 0,
          ...directionMap[direction],
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: elementRef.current,
            start: `top ${threshold * 100}%`,
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, elementRef);

    return () => ctx.revert();
  }, [direction, delay, duration, distance, threshold]);

  return (
    <div ref={elementRef} className={cn("will-change-transform", className)} data-testid="fade-in">
      {children}
    </div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function Parallax({ children, className, speed = 0.5, direction = "vertical" }: ParallaxProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        [direction === "vertical" ? "yPercent" : "xPercent"]: -100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: elementRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, elementRef);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={elementRef} className={cn("will-change-transform", className)} data-testid="parallax">
      {children}
    </div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, className, delay = 0, duration = 0.8 }: ScaleInProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration,
          delay,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: elementRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, elementRef);

    return () => ctx.revert();
  }, [delay, duration]);

  return (
    <div ref={elementRef} className={cn("will-change-transform", className)} data-testid="scale-in">
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerContainer({ children, className, stagger = 0.1, delay = 0 }: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const elements = containerRef.current.children;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [stagger, delay]);

  return (
    <div ref={containerRef} className={className} data-testid="stagger-container">
      {children}
    </div>
  );
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  bgColor?: string;
  delay?: number;
}

export function Reveal({
  children,
  className,
  direction = "left",
  bgColor = "hsl(var(--accent))",
  delay = 0,
}: RevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const overlay = containerRef.current.querySelector(".reveal-overlay");
    const content = containerRef.current.querySelector(".reveal-content");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
        },
      });

      const isHorizontal = direction === "left" || direction === "right";
      const startValue = direction === "left" || direction === "up" ? "0%" : "100%";
      const endValue = direction === "left" || direction === "up" ? "100%" : "0%";

      tl.set(content, { visibility: "hidden" })
        .fromTo(
          overlay,
          { [isHorizontal ? "x" : "y"]: startValue === "0%" ? "-100%" : "0%" },
          {
            [isHorizontal ? "x" : "y"]: "0%",
            duration: 0.5,
            delay,
            ease: "power3.inOut",
          }
        )
        .set(content, { visibility: "visible" })
        .to(overlay, {
          [isHorizontal ? "x" : "y"]: startValue === "0%" ? "100%" : "-100%",
          duration: 0.5,
          ease: "power3.inOut",
        });
    }, containerRef);

    return () => ctx.revert();
  }, [direction, delay]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)} data-testid="reveal">
      <div className="reveal-content">{children}</div>
      <div
        className="reveal-overlay absolute inset-0"
        style={{ backgroundColor: bgColor }}
      />
    </div>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className, strength = 0.3 }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current || prefersReducedMotion()) return;

    const button = buttonRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <button ref={buttonRef} className={cn("will-change-transform", className)} data-testid="magnetic-button">
      {children}
    </button>
  );
}

interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export function ScrollProgress({ className, color = "hsl(var(--accent))" }: ScrollProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }, progressRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={progressRef}
      className={cn("fixed top-0 left-0 right-0 h-1 origin-left z-50", className)}
      style={{ backgroundColor: color, transform: "scaleX(0)" }}
      data-testid="scroll-progress"
    />
  );
}

export function MarqueeText({
  children,
  speed = 50,
  direction = "left",
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const container = containerRef.current;
    const content = container.querySelector(".marquee-content") as HTMLElement;
    if (!content) return;

    const setupAnimation = () => {
      const contentWidth = content.scrollWidth;
      if (contentWidth <= 0) return;
      
      const duration = Math.max(contentWidth / speed, 1);

      gsap.killTweensOf(content);
      gsap.to(content, {
        x: direction === "left" ? -contentWidth / 2 : contentWidth / 2,
        duration,
        ease: "none",
        repeat: -1,
      });
    };

    const ctx = gsap.context(() => {
      requestAnimationFrame(setupAnimation);
    }, containerRef);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <div className="marquee-content flex whitespace-nowrap">
        {children}
        {children}
      </div>
    </div>
  );
}

export function TextSplitReveal({
  children,
  className,
  stagger = 0.02,
  duration = 0.5,
}: {
  children: string;
  className?: string;
  stagger?: number;
  duration?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion() || typeof children !== "string" || !children) {
      setIsVisible(true);
      return;
    }

    const container = containerRef.current;
    const chars = container.querySelectorAll(".split-char");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          y: "100%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
            onEnter: () => setIsVisible(true),
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [stagger, duration]);

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap">
        {children.split("").map((char, i) => (
          <span
            key={i}
            className="split-char inline-block overflow-hidden"
            style={{ opacity: isVisible ? 1 : 0 }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GlitchText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)} data-text={children}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 -z-10 text-accent/50 animate-pulse"
        style={{ clipPath: "inset(45% 0 45% 0)" }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}

export function RotatingText({
  words,
  interval = 3000,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, [currentIndex]);

  return (
    <div ref={containerRef} className={cn("inline-block", className)}>
      {words[currentIndex]}
    </div>
  );
}
