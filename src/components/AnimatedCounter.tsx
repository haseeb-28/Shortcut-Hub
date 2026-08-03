"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";

interface Props {
  value: number;
  duration?: number;
  className?: string;
}

/** Counts up from its previous value to `value` whenever it changes. */
export function AnimatedCounter({ value, duration = 0.8, className }: Props) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      if (nodeRef.current) nodeRef.current.textContent = value.toLocaleString();
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(latest).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value, duration, motionValue, prefersReducedMotion]);

  return (
    <span ref={nodeRef} className={className}>
      0
    </span>
  );
}
