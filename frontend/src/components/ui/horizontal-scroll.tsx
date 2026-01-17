import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const scroll = scrollRef.current;
    if (!container || !scroll) return;

    const ctx = gsap.context(() => {
      const scrollWidth = scroll.scrollWidth - container.offsetWidth;

      gsap.to(scroll, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={scrollRef} className="flex">
        {children}
      </div>
    </div>
  );
}

interface HorizontalScrollCardProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function HorizontalScrollCard({
  children,
  className = "",
  width = "80vw",
}: HorizontalScrollCardProps) {
  return (
    <div
      className={`flex-shrink-0 ${className}`}
      style={{ width, minWidth: width }}
    >
      {children}
    </div>
  );
}

export function ParallaxText({
  children,
  speed = 1,
  direction = "left",
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const text = textRef.current;
    if (!text) return;

    const ctx = gsap.context(() => {
      gsap.to(text, {
        x: direction === "left" ? "-50%" : "50%",
        ease: "none",
        scrollTrigger: {
          trigger: text,
          start: "top bottom",
          end: "bottom top",
          scrub: speed,
        },
      });
    }, textRef);

    return () => ctx.revert();
  }, [speed, direction]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={textRef} className="whitespace-nowrap flex">
        <span className="px-4">{children}</span>
        <span className="px-4">{children}</span>
        <span className="px-4">{children}</span>
        <span className="px-4">{children}</span>
      </div>
    </div>
  );
}

export function TextRevealOnScroll({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const words = children.split(" ");
    text.innerHTML = words
      .map((word) => `<span class="inline-block opacity-20">${word}</span>`)
      .join(" ");

    const spans = text.querySelectorAll("span");

    const ctx = gsap.context(() => {
      gsap.to(spans, {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <div ref={containerRef} className={className}>
      <div ref={textRef} className="text-4xl md:text-6xl font-serif font-bold leading-tight">
        {children}
      </div>
    </div>
  );
}

export function ScrubText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".scrub-char");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          opacity: 0.1,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.02,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            end: "top 20%",
            scrub: 0.5,
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children.split("").map((char, i) => (
        <span
          key={i}
          className="scrub-char inline-block"
          style={{ opacity: 0.1 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
