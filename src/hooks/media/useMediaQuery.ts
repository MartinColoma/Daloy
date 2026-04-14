import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   useMediaQuery.ts
   Reactive media query hook.
   Returns true when the query matches.
   SSR-safe: defaults to false until mounted.
───────────────────────────────────────────── */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    setMatches(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport ≥ 1024px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}