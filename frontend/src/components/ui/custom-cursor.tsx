import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;

    if (!cursor || !dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out",
      });

      gsap.to(ring, {
        x: mouseX,
        y: mouseY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      gsap.to(ring, {
        scale: 0.8,
        duration: 0.15,
        ease: "power2.out",
      });
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      gsap.to(ring, {
        scale: isHovering ? 1.5 : 1,
        duration: 0.15,
        ease: "power2.out",
      });
    };

    const handleMouseEnterInteractive = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsHovering(true);
      
      const cursorLabel = target.dataset.cursorLabel;
      if (cursorLabel) {
        setCursorText(cursorLabel);
      }

      gsap.to(ring, {
        scale: 1.5,
        duration: 0.2,
        ease: "power2.out",
      });
      ring.style.borderColor = "hsl(var(--accent))";

      gsap.to(dot, {
        scale: 0.5,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const handleMouseLeaveInteractive = () => {
      setIsHovering(false);
      setCursorText("");

      gsap.to(ring, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
      ring.style.borderColor = "hsl(var(--foreground) / 0.3)";

      gsap.to(dot, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    const updateInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, [data-cursor-hover], input, textarea, select, [role='button']"
      );

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnterInteractive);
        el.removeEventListener("mouseleave", handleMouseLeaveInteractive);
        el.addEventListener("mouseenter", handleMouseEnterInteractive);
        el.addEventListener("mouseleave", handleMouseLeaveInteractive);
      });
    };

    updateInteractiveElements();
    
    const observer = new MutationObserver(() => {
      updateInteractiveElements();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();
      document.body.style.cursor = "auto";
    };
  }, []);

  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  if (isTouchDevice) return null;

  return (
    <div ref={cursorRef} className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/30 mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {cursorText && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-medium whitespace-nowrap text-accent">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}

export function MagneticWrapper({
  children,
  strength = 0.3,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return <div ref={ref}>{children}</div>;
}
