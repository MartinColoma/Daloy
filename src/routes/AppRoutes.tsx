import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
// import ProtectedLayout from "@/layouts/ProtectedLayout";   // uncomment when ready
// import RootLayout from "@/layouts";                        // uncomment when ready

// Public pages
import LandingPage from "../pages/public/LandingPage";
import SignInPage from "../pages/public/SignInPage";
import SignUpPage from "../pages/public/SignUpPage";

// Onboarding pages (uncomment as you build them)
// import OnboardingLayout from "@/pages/onboarding/OnboardingLayout";
// import StepCurrency from "@/pages/onboarding/StepCurrency";
// import StepWallets from "@/pages/onboarding/StepWallets";
// import StepBudgets from "@/pages/onboarding/StepBudgets";

// App pages (uncomment as you build them)
// import HomePage from "@/pages/app/HomePage";
// import WalletPage from "@/pages/app/WalletPage";
// import HistoryPage from "@/pages/app/HistoryPage";
// import GroupsPage from "@/pages/app/GroupsPage";
// import InsightsPage from "@/pages/app/InsightsPage";
// import ProfilePage from "@/pages/app/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public (unauthenticated) ──────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>

      {/* ─── Onboarding (auth required, onboarding_done = false) ── */}
      {/*
      <Route path="/onboarding" element={<ProtectedLayout requireOnboarding={false} />}>
        <Route element={<OnboardingLayout />}>
          <Route index element={<Navigate to="currency" replace />} />
          <Route path="currency" element={<StepCurrency />} />
          <Route path="wallets" element={<StepWallets />} />
          <Route path="budgets" element={<StepBudgets />} />
        </Route>
      </Route>
      */}

      {/* ─── App (auth required, onboarding_done = true) ────────── */}
      {/*
      <Route element={<ProtectedLayout />}>
        <Route element={<RootLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      */}

      {/* ─── Fallback ────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}