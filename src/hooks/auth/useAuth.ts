import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/auth/authService";
import type { SignInPayload, SignUpPayload } from "../../services/auth/authService";

export const useAuth = () => {
  const { user, tokens, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "Something went wrong";
    setError(message);

    Swal.fire({
      icon: "error",
      title: "Authentication Failed",
      text: message,
    });
  };

const signIn = async (payload: SignInPayload) => {
  setIsLoading(true);
  setError(null);
  try {
    const { user, tokens } = await authService.signIn(payload);

    // 🔍 TEMP DEBUG — remove after fixing
    console.log("RAW user from API:", user);
    console.log("onboardingDone:", user.onboardingDone);
    console.log("navigate target:", user.onboardingDone ? "/home" : "/onboarding/currency");

    setAuth(user, tokens);

    console.log("authStore after setAuth:", useAuthStore.getState());

    await Swal.fire({
      icon: "success",
      title: "Welcome back!",
      text: "Successfully signed in.",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate(user.onboardingDone ? "/home" : "/onboarding/currency");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";

    // Supabase returns this exact string when email confirmation is pending
    if (message.toLowerCase().includes("email not confirmed")) {
      setError("Please confirm your email before signing in. Check your inbox.");
      await Swal.fire({
        icon: "info",
        title: "Email not confirmed",
        html: `
          <p style="font-family:'Outfit',sans-serif;color:#3D3A34;font-size:0.9rem;line-height:1.6;">
            Please check your inbox and click the confirmation link we sent you before signing in.
          </p>
        `,
        confirmButtonText: "Got it",
        confirmButtonColor: "#2D5016",
      });
      return;
    }

    // User doesn't exist or wrong password
    if (message.toLowerCase().includes("invalid login credentials")) {
      setError("Invalid email or password.");
      await Swal.fire({
        icon: "error",
        title: "Sign in failed",
        text: "Invalid email or password. Please try again.",
        confirmButtonColor: "#2D5016",
      });
      return;
    }

    handleError(err);
  } finally {
    setIsLoading(false);
  }
};

const signUp = async (payload: SignUpPayload) => {
  setIsLoading(true);
  setError(null);
  try {
    const result = await authService.signUp(payload);

    // Email confirmation required — user created but not yet verified
    if ("requiresEmailConfirmation" in result) {
      await Swal.fire({
        icon: "info",
        title: "Check your inbox",
        html: `
          <p style="font-family:'Outfit',sans-serif;color:#3D3A34;font-size:0.9rem;line-height:1.6;">
            We sent a confirmation link to <strong>${payload.email}</strong>.<br/>
            Please verify your email before signing in.
          </p>
        `,
        confirmButtonText: "Got it",
        confirmButtonColor: "#2D5016",
      });
      navigate("/sign-in");
      return;
    }

    // Email confirmation disabled — session returned immediately
    setAuth(result.user, result.tokens);

    await Swal.fire({
      icon: "success",
      title: "Account Created",
      text: "Welcome to Daloy!",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/onboarding/currency");
  } catch (err) {
    handleError(err);
  } finally {
    setIsLoading(false);
  }
};

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();

      // NOTE:
      // Google OAuth redirects, so this might not show
      // unless you're handling callback manually

      await Swal.fire({
        icon: "success",
        title: "Redirecting...",
        text: "Signing in with Google",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      handleError(err);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();

      await Swal.fire({
        icon: "success",
        title: "Signed Out",
        text: "You have been logged out.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      // silent fail
    } finally {
      clearAuth();
      setIsLoading(false);
      navigate("/sign-in");
    }
  };

  const clearError = () => setError(null);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };
};