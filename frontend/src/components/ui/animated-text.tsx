import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextProps {
  children: string;
  className?: string;
  variant?: "chars" | "words" | "lines" | "reveal";
  delay?: number;
  stagger?: number;
  duration?: number;
  trigger?: boolean;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function AnimatedText({
  children,
  className,
  variant = "words",
  delay = 0,
  stagger = 0.05,
  duration = 0.8,
  trigger = true,
  as: Component = "div",
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let elements: HTMLElement[] = [];

    if (variant === "chars") {
      container.innerHTML = children
        .split("")
        .map((char) => `<span class="inline-block">${char === " " ? "&nbsp;" : char}</span>`)
        .join("");
      elements = Array.from(container.querySelectorAll("span"));
    } else if (variant === "words") {
      container.innerHTML = children
        .split(" ")
        .map((word) => `<span class="inline-block mr-[0.25em]">${word}</span>`)
        .join("");
      elements = Array.from(container.querySelectorAll("span"));
    } else if (variant === "lines") {
      elements = [container];
    } else if (variant === "reveal") {
      container.innerHTML = `<span class="inline-block overflow-hidden"><span class="inline-block">${children}</span></span>`;
      elements = Array.from(container.querySelectorAll("span > span"));
    }

    const ctx = gsap.context(() => {
      const animation = gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: variant === "reveal" ? "100%" : 30,
          rotateX: variant === "chars" ? -90 : 0,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration,
          delay,
          stagger,
          ease: "power3.out",
          scrollTrigger: trigger
            ? {
                trigger: container,
                start: "top 85%",
                once: true,
              }
            : undefined,
        }
      );

      return animation;
    }, containerRef);

    return () => ctx.revert();
  }, [children, variant, delay, stagger, duration, trigger]);

  return (
    <Component
      ref={containerRef as any}
      className={cn("will-change-transform", className)}
      data-testid="animated-text"
    >
      {children}
    </Component>
  );
}

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  trigger?: boolean;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
  decimals = 0,
  className,
  trigger = true,
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated.current) return;

    const element = counterRef.current;
    const obj = { value: 0 };

    const scrollTriggerConfig = trigger
      ? {
          trigger: element,
          start: "top 85%",
          once: true,
          onEnter: () => {
            hasAnimated.current = true;
          },
        }
      : undefined;

    const animation = gsap.to(obj, {
      value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = `${prefix}${obj.value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`;
      },
      scrollTrigger: scrollTriggerConfig,
    });

    if (!trigger) {
      hasAnimated.current = true;
    }

    return () => {
      animation.kill();
    };
  }, [value, prefix, suffix, duration, decimals, trigger]);

  return (
    <span ref={counterRef} className={cn("tabular-nums", className)} data-testid="animated-counter">
      {prefix}0{suffix}
    </span>
  );
}

interface SplitTextProps {
  children: string;
  className?: string;
  charClassName?: string;
  delay?: number;
}

export function SplitText({ children, className, charClassName, delay = 0 }: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".char");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 50,
          rotateX: -90,
          transformOrigin: "50% 50% -50px",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          delay,
          stagger: 0.03,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)} data-testid="split-text">
      {children.split("").map((char, i) => (
        <span
          key={i}
          className={cn("char inline-block will-change-transform", charClassName)}
          style={{ perspective: "1000px" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({ text, className, speed = 50, delay = 0, cursor = true }: TypewriterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    let currentIndex = 0;

    const ctx = gsap.context(() => {
      gsap.delayedCall(delay / 1000, () => {
        const interval = setInterval(() => {
          if (currentIndex <= text.length) {
            element.textContent = text.slice(0, currentIndex);
            currentIndex++;
          } else {
            clearInterval(interval);
          }
        }, speed);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text, speed, delay]);

  return (
    <span className={cn("", className)} data-testid="typewriter">
      <span ref={containerRef} />
      {cursor && <span className="animate-pulse ml-0.5">|</span>}
    </span>
  );
}
