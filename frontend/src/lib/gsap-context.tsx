import { createContext, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GSAPContextType {
  isReady: boolean;
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}

const GSAPContext = createContext<GSAPContextType | null>(null);

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    gsap.config({
      nullTargetWarn: false,
    });

    if (prefersReducedMotion) {
      gsap.defaults({
        duration: 0,
        ease: "none",
      });
    } else {
      gsap.defaults({
        ease: "power3.out",
        duration: 0.8,
      });
    }

    setIsReady(true);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <GSAPContext.Provider value={{ isReady, gsap, ScrollTrigger }}>
      {children}
    </GSAPContext.Provider>
  );
}

export function useGSAP() {
  const context = useContext(GSAPContext);
  if (!context) {
    throw new Error("useGSAP must be used within a GSAPProvider");
  }
  return context;
}

export function useScrollTrigger(
  callback: (gsap: typeof import("gsap").default, ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger) => gsap.core.Timeline | gsap.core.Tween | void,
  deps: React.DependencyList = []
) {
  const { isReady, gsap, ScrollTrigger } = useGSAP();
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!isReady) return;

    const result = callback(gsap, ScrollTrigger);
    if (result) {
      timelineRef.current = result;
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isReady, ...deps]);

  return timelineRef;
}

export function useTextReveal(elementRef: React.RefObject<HTMLElement>, options?: gsap.TweenVars) {
  const { isReady, gsap } = useGSAP();

  useEffect(() => {
    if (!isReady || !elementRef.current) return;

    const element = elementRef.current;
    const text = element.textContent || "";
    
    element.innerHTML = text
      .split("")
      .map((char) => `<span class="inline-block">${char === " " ? "&nbsp;" : char}</span>`)
      .join("");

    const chars = element.querySelectorAll("span");

    gsap.fromTo(
      chars,
      { opacity: 0, y: 20, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 0.6,
        ease: "back.out(1.7)",
        ...options,
      }
    );
  }, [isReady]);
}

export function useMagneticEffect(elementRef: React.RefObject<HTMLElement>, strength: number = 0.3) {
  const { isReady, gsap } = useGSAP();

  useEffect(() => {
    if (!isReady || !elementRef.current) return;

    const element = elementRef.current;

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
  }, [isReady, strength]);
}

export { gsap, ScrollTrigger };
