import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/* ─────────────────────────────────────────────
   OnboardingLayout.tsx
   Step shell for /onboarding/* routes.
   Shows step counter, progress bar, back button.
   Content rendered via <Outlet />.
───────────────────────────────────────────── */

const STEPS = [
  { path: "/onboarding/currency", label: "Base Currency" },
  { path: "/onboarding/wallets",  label: "Your Wallets"  },
  { path: "/onboarding/budgets",  label: "Budget Limits" },
];

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = STEPS.findIndex(s => s.path === location.pathname);
  const step         = currentIndex === -1 ? 0 : currentIndex;
  const total        = STEPS.length;
  const progressPct  = ((step + 1) / total) * 100;

  function handleBack() {
    if (step > 0) navigate(STEPS[step - 1].path);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{ background: "var(--bg)" }}
    >
      {/* Header row */}
      <div className="w-full max-w-[480px] mb-8">
        <div className="flex items-center justify-between mb-5">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 font-outfit text-[0.8rem] transition-opacity disabled:opacity-0 disabled:pointer-events-none"
            style={{ color: "var(--ink3)" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {/* Step counter */}
          <span
            className="font-mono text-[0.7rem] tracking-[0.12em] uppercase"
            style={{ color: "var(--ink4)" }}
          >
            Step {step + 1} of {total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: "var(--bg3)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: "var(--forest)",
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-[480px]">
        <Outlet />
      </div>

      {/* Logo watermark */}
      <p
        className="font-lora font-bold text-[1rem] tracking-tight mt-auto pt-12"
        style={{ color: "var(--ink4)" }}
      >
        dal<span style={{ color: "var(--forest-xl)" }}>oy</span>
      </p>
    </div>
  );
}