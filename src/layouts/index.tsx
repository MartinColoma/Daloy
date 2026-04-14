import { useIsDesktop } from "../hooks/media/useMediaQuery";
import DesktopLayout    from "./DesktopLayout";
import MobileLayout     from "./MobileLayout";

/* ─────────────────────────────────────────────
   layouts/index.tsx — RootLayout
   Reads the breakpoint and renders either
   DesktopLayout or MobileLayout.

   NOTE: This is only rendered for protected routes.
   PublicLayout has its own simple wrapper.

   Nesting order per SKILL.md:
   RootLayout → ProtectedLayout → DesktopLayout|MobileLayout → page
───────────────────────────────────────────── */

export default function RootLayout() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
}