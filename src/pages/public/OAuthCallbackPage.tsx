import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth/authService";
import { useAuthStore } from "../../stores/authStore";

/**
 * OAuthCallbackPage
 *
 * Mounted at /oauth/callback.
 * Google redirects here with tokens in the URL hash after the user approves.
 * (Supabase implicit flow: #access_token=...&refresh_token=...)
 *
 * Flow:
 *   1. Extract tokens from URL hash
 *   2. POST to /api/auth/oauth/callback (BE validates token, builds AuthUser)
 *   3. Save user + tokens to authStore
 *   4. Redirect → /onboarding/currency (new user) or /home (returning user)
 */
const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const hasRun = useRef(false); // prevent double-invocation in React Strict Mode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      // Implicit flow returns tokens in the hash: #access_token=...&refresh_token=...
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken  = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (!accessToken) {
        console.error("[OAuthCallbackPage] No access_token in URL hash");
        navigate("/sign-in?error=oauth_failed");
        return;
      }

      try {
        const { user, tokens } = await authService.exchangeOAuthCode(
          accessToken,
          refreshToken ?? ""
        );
        setAuth(user, tokens);
        navigate(user.onboardingDone ? "/home" : "/onboarding/currency");
      } catch (err) {
        console.error("[OAuthCallbackPage] OAuth callback error:", err);
        navigate("/sign-in?error=oauth_failed");
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        gap: "16px",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--bg3)",
          borderTopColor: "var(--forest)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: "0.9rem",
          color: "var(--ink3)",
        }}
      >
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthCallbackPage;