import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/* ─────────────────────────────────────────────
   PublicLayout.tsx
   Wraps unauthenticated pages: /, /sign-in, /sign-up.
   If the user already has a session → redirect to /home.
   No nav chrome — pages manage their own visuals.
───────────────────────────────────────────── */

export default function PublicLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user            = useAuthStore(s => s.user);

  if (isAuthenticated) {
    return <Navigate to={user?.onboardingDone ? "/home" : "/onboarding/currency"} replace />;
  }

  return <Outlet />;
}