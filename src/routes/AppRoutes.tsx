import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout    from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import RootLayout      from "../layouts";

import OAuthCallbackPage from "../pages/public/OAuthCallbackPage";

// Public pages
import LandingPage from "../pages/public/LandingPage";
import SignInPage  from "../pages/public/SignInPage";
import SignUpPage  from "../pages/public/SignUpPage";

// Onboarding pages
import OnboardingLayout from "../pages/onboarding/OnboardingLayout";
import StepCurrency     from "../pages/onboarding/StepCurrency";
import StepWallets      from "../pages/onboarding/StepWallets";
import StepBudgets      from "../pages/onboarding/StepBudgets";

// App pages
import HomePage     from "../pages/app/HomePage";
import WalletPage   from "../pages/app/WalletPage";
import HistoryPage  from "../pages/app/HistoryPage";
import ProfilePage  from "../pages/app/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ─── Public (unauthenticated) ──────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>

      {/* ─── OAuth callback — outside PublicLayout (no auth guard) ── */}
      <Route path="/auth/v1/callback" element={<OAuthCallbackPage />} />

      {/* ─── Onboarding ─────────────────────────────────────────── */}
      <Route path="/onboarding" element={<ProtectedLayout requireOnboarding={false} />}>
        <Route element={<OnboardingLayout />}>
          <Route index           element={<Navigate to="currency" replace />} />
          <Route path="currency" element={<StepCurrency />} />
          <Route path="wallets"  element={<StepWallets />} />
          <Route path="budgets"  element={<StepBudgets />} />
        </Route>
      </Route>

      {/* ─── App ────────────────────────────────────────────────── */}
      <Route element={<ProtectedLayout />}>
        <Route element={<RootLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      {/* ─── Fallback ───────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}