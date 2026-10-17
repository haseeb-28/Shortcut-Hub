"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { NAVIGATION_START_EVENT } from "@/lib/navigation";
import { SplashScreen } from "./SplashScreen";

const MAX_WAIT_MS = 15000;

export function NavigationSplash() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const previousPath = useRef(pathname);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function stopLoading() {
      setLoading(false);
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    }

    function startLoading() {
      setLoading(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(stopLoading, MAX_WAIT_MS);
    }

    function handleLinkClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }

      startLoading();
    }

    document.addEventListener("click", handleLinkClick);
    window.addEventListener(NAVIGATION_START_EVENT, startLoading);
    window.addEventListener("popstate", startLoading);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener(NAVIGATION_START_EVENT, startLoading);
      window.removeEventListener("popstate", startLoading);
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;

    previousPath.current = pathname;
    setLoading(false);
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && <SplashScreen key="navigation-splash" />}
    </AnimatePresence>
  );
}
