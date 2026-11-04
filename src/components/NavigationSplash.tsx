"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "./SplashScreen";

const SPLASH_DURATION_MS = 2000;

export function NavigationSplash() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {loading && <SplashScreen key="navigation-splash" />}
    </AnimatePresence>
  );
}
