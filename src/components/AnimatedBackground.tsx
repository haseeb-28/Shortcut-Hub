"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const PARTICLES = [
  { left: "8%", top: "18%", size: 3, delay: 0, duration: 7 },
  { left: "18%", top: "72%", size: 2, delay: 1.2, duration: 8 },
  { left: "31%", top: "32%", size: 3, delay: 2.1, duration: 9 },
  { left: "47%", top: "82%", size: 2, delay: 0.8, duration: 7.5 },
  { left: "58%", top: "20%", size: 3, delay: 2.8, duration: 8.5 },
  { left: "71%", top: "65%", size: 2, delay: 1.5, duration: 9 },
  { left: "84%", top: "28%", size: 3, delay: 3.2, duration: 7 },
  { left: "92%", top: "78%", size: 2, delay: 0.5, duration: 8 },
];

export function AnimatedBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, [mouseX, mouseY, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Ambient radial glow */}
      <motion.div
        className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-amber/10 blur-[120px]"
        style={
          reducedMotion
            ? undefined
            : {
                x: smoothX,
                y: smoothY,
              }
        }
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.35, 0.55, 0.35],
                scale: [0.95, 1.08, 0.95],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* Secondary blue glow */}
      <motion.div
        className="absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-blue-500/8 blur-[130px]"
        style={
          reducedMotion
            ? undefined
            : {
                x: smoothX,
                y: smoothY,
              }
        }
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.25, 0.45, 0.25],
                scale: [1.05, 0.92, 1.05],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />

      {/* Moving perspective grid */}
      <motion.div
        className="absolute inset-[-15%] opacity-30"
        style={
          reducedMotion
            ? undefined
            : {
                x: smoothX,
                y: smoothY,
              }
        }
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(255,255,255,0.035) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255,255,255,0.035) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "56px 56px",
            transform: "perspective(900px) rotateX(62deg) scale(1.5)",
            transformOrigin: "center bottom",
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {!reducedMotion &&
        PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-amber/50 blur-[0.5px]"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -18, 0],
              x: [0, index % 2 === 0 ? 8 : -8, 0],
              opacity: [0.15, 0.65, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Center atmospheric glow */}
      <motion.div
        className="absolute left-1/2 top-[42%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/5 blur-[110px]"
        animate={
          reducedMotion
            ? undefined
            : {
                opacity: [0.2, 0.4, 0.2],
                scale: [0.9, 1.1, 0.9],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
    </div>
  );
}