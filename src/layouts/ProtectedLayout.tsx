import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LayoutProvider } from "./LayoutContext";

/* ─────────────────────────────────────────────
   ProtectedLayout.tsx
   Auth guard for all protected routes.

   Props:
     requireOnboarding (default: true)
       true  → the route expects onboarding_done = true
               redirect to /onboarding/currency if not done
       false → the route is the onboarding flow itself
               redirect to /home if onboarding already done

   Guard logic:
   1. No session                             → /sign-in
   2. requireOnboarding=true  + not done     → /onboarding/currency
   3. requireOnboarding=false + already done → /home
   4. All clear                              → render children in LayoutProvider
───────────────────────────────────────────── */

interface ProtectedLayoutProps {
  requireOnboarding?: boolean;
}

export default function ProtectedLayout({ requireOnboarding = true }: ProtectedLayoutProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user            = useAuthStore(s => s.user);
  const location        = useLocation();

  // 1. Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // 2. App routes but onboarding incomplete → push to onboarding
  if (requireOnboarding && !user.onboardingDone) {
    return <Navigate to="/onboarding/currency" replace />;
  }

  // 3. Onboarding routes but already done → push to app
  if (!requireOnboarding && user.onboardingDone) {
    return <Navigate to="/home" replace />;
  }

  return (
    <LayoutProvider>
      <Outlet />
    </LayoutProvider>
  );
}