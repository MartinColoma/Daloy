import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

/**
 * PublicLayout
 * Wraps unauthenticated pages: /, /sign-in, /sign-up
 * - Redirects authenticated users to /home
 * - Provides no nav chrome (pages are fully self-contained)
 *
 * TODO: swap the `isAuthenticated` stub with your real Supabase session check
 *       e.g. const { session } = useAuth();
 */
const isAuthenticated = false; // stub — replace with useAuth()

export default function PublicLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  // Nothing to render while redirecting
  if (isAuthenticated) return null;

  return <Outlet />;
}