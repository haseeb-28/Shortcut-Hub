"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);

      const exitTimer = window.setTimeout(() => {
        onComplete();
      }, 450);

      return () => window.clearTimeout(exitTimer);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [onComplete]);

  if (!visible) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0F1E]"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0A0F1E]"
    >
      {/* ============================================================
          BACKGROUND EFFECTS
         ============================================================ */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.4,
        }}
        animate={{
          opacity: 0.4,
          scale: 1.4,
        }}
        transition={{
          duration: 1.8,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute h-96 w-96 rounded-full bg-amber/20 blur-[110px]"
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 0.15,
          scale: 1.8,
        }}
        transition={{
          duration: 2.2,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute h-64 w-64 rounded-full bg-orange-500/20 blur-[90px]"
      />

      {/* ============================================================
          MAIN LOGO
         ============================================================ */}

      <div
        className="relative flex flex-col items-center"
        style={{
          perspective: 1000,
        }}
      >
        {/* Rotating outer ring */}
        <motion.div
          initial={{
            opacity: 0,
            rotateX: -70,
            rotateZ: -25,
            scale: 0.4,
          }}
          animate={{
            opacity: 1,
            rotateX: 0,
            rotateZ: 0,
            scale: 1,
          }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute h-36 w-36 rounded-[2rem] border border-amber/20"
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              "0 0 60px rgba(242,183,5,0.12), inset 0 0 35px rgba(242,183,5,0.04)",
          }}
        />

        {/* Continuous ring rotation */}
        <motion.div
          animate={{
            rotateZ: 360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute h-40 w-40 rounded-[2.2rem] border border-dashed border-amber/10"
        />

        {/* 3D logo tile */}
        <motion.div
          initial={{
            opacity: 0,
            rotateY: 90,
            rotateX: 15,
            scale: 0.35,
          }}
          animate={{
            opacity: 1,
            rotateY: 0,
            rotateX: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.95,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex h-28 w-28 items-center justify-center rounded-[1.7rem] border border-amber/50 bg-gradient-to-br from-amber via-amber/90 to-orange-500 shadow-[0_25px_80px_rgba(242,183,5,0.25)]"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Back depth */}
          <div
            className="absolute inset-0 rounded-[1.7rem] bg-orange-700/70"
            style={{
              transform: "translateZ(-12px) translate(6px, 7px)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.4,
              rotateY: -45,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10"
            style={{
              transform: "translateZ(20px)",
            }}
          >
            <Image
              src="/shortcut-hub-logo.png"
              alt="Shortcut Hub"
              width={50}
              height={50}
              priority
              className="h-14 w-14 object-contain invert"
              style={{
                filter:
                  "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
              }}
            />
          </motion.div>

          {/* Glass highlight */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[1.6rem] bg-gradient-to-br from-white/30 via-transparent to-transparent" />

          {/* Moving shine */}
          <motion.div
            initial={{
              x: "-150%",
            }}
            animate={{
              x: "150%",
            }}
            transition={{
              duration: 1.4,
              delay: 1,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute h-full w-1/3 skew-x-[-20deg] bg-white/20 blur-md"
          />
        </motion.div>

        {/* ============================================================
            BRAND NAME
           ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            delay: 0.65,
            ease: "easeOut",
          }}
          className="mt-10 text-center"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight text-mist">
            Shortcut{" "}
            <span className="text-amber">Hub</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 1,
            }}
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink2"
          >
            Your personal launchpad
          </motion.p>
        </motion.div>

        {/* ============================================================
            LOADING INDICATOR
           ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.15,
          }}
          className="mt-9 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{
                y: [0, -5, 0],
                opacity: [0.25, 1, 0.25],
                scale: [0.8, 1.15, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: dot * 0.15,
              }}
              className="h-1.5 w-1.5 rounded-full bg-amber"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}