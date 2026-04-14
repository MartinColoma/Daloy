import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/auth/useAuth";

/* ─────────────────────────────────────────────
   SignUpPage.tsx
   Public auth page — email/password + Google OAuth.
   On success → /onboarding/currency (new users always
   go through onboarding before /home).
   If email confirmation is required → Swal info →
   redirect to /sign-in.
───────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

const PW_RULES = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter",  test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number",            test: (pw: string) => /\d/.test(pw) },
];

export default function SignUpPage() {
  const { signUp, signInWithGoogle, isLoading, error, clearError } = useAuth();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const pwValid = PW_RULES.every(r => r.test(password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwValid) return;
    clearError();
    await signUp({ email, password, fullName: name });
  }

  async function handleGoogle() {
    clearError();
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Card ── */}
      <div
        className="w-full max-w-[420px] border rounded-[var(--radius-xl)] px-8 py-10"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--bg3)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-lora font-bold text-[1.25rem] tracking-tight no-underline block mb-8"
          style={{ color: "var(--ink)" }}
        >
          dal<span style={{ color: "var(--forest)" }}>oy</span>
        </Link>

        {/* Heading */}
        <h1
          className="font-lora font-bold text-[1.6rem] tracking-tight mb-1"
          style={{ color: "var(--ink)" }}
        >
          Start your flow.
        </h1>
        <p
          className="font-outfit font-light text-[0.9rem] mb-8"
          style={{ color: "var(--ink3)" }}
        >
          Free forever. No credit card needed.
        </p>

        {/* ── Google button ── */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 font-outfit font-medium text-[0.875rem] border-[1.5px] rounded-[var(--radius-sm)] py-[0.7rem] px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          style={{ color: "var(--ink2)", borderColor: "var(--bg3)", background: "var(--bg)" }}
          onMouseEnter={e => { if (!googleLoading && !isLoading) e.currentTarget.style.borderColor = "var(--forest-xl)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
        >
          {googleLoading
            ? <span className="w-[18px] h-[18px] rounded-full border-2 border-current border-t-transparent animate-spin" />
            : <GoogleIcon />
          }
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "var(--bg3)" }} />
          <span className="font-mono text-[0.65rem] tracking-[0.12em] uppercase" style={{ color: "var(--ink4)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--bg3)" }} />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-[0.83rem] font-outfit"
              style={{ background: "#FBF0F0", border: "1px solid #E8B5B5", color: "var(--expense)" }}
            >
              <AlertCircle size={15} className="mt-[1px] shrink-0" />
              {error}
            </div>
          )}

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-outfit font-medium text-[0.78rem]" style={{ color: "var(--ink2)" }}>
              Display name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Juan dela Cruz"
              className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] px-3.5 py-[0.65rem] outline-none transition-colors"
              style={{ background: "var(--bg)", border: "1.5px solid var(--bg3)", color: "var(--ink)" }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-outfit font-medium text-[0.78rem]" style={{ color: "var(--ink2)" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] px-3.5 py-[0.65rem] outline-none transition-colors"
              style={{ background: "var(--bg)", border: "1.5px solid var(--bg3)", color: "var(--ink)" }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-outfit font-medium text-[0.78rem]" style={{ color: "var(--ink2)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] px-3.5 py-[0.65rem] pr-11 outline-none transition-colors"
                style={{ background: "var(--bg)", border: "1.5px solid var(--bg3)", color: "var(--ink)" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; setPwFocused(true); }}
                onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; setPwFocused(false); }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                style={{ color: "var(--ink4)" }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength checklist */}
            {(pwFocused || password.length > 0) && (
              <ul className="flex flex-col gap-1 mt-1">
                {PW_RULES.map(rule => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className="flex items-center gap-2 font-outfit text-[0.75rem] transition-colors"
                      style={{ color: passed ? "var(--income)" : "var(--ink4)" }}
                    >
                      <CheckCircle2 size={13} strokeWidth={passed ? 2.5 : 1.5} style={{ opacity: passed ? 1 : 0.4 }} />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || googleLoading || !pwValid}
            className="w-full flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white rounded-[var(--radius-sm)] py-[0.7rem] mt-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--forest)" }}
            onMouseEnter={e => { if (!isLoading && !googleLoading && pwValid) e.currentTarget.style.background = "var(--forest-m)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
          >
            {isLoading
              ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <>Create account <ArrowRight size={14} /></>
            }
          </button>
        </form>

        {/* Footer link */}
        <p className="font-outfit font-light text-[0.83rem] text-center mt-6" style={{ color: "var(--ink3)" }}>
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium no-underline hover:underline" style={{ color: "var(--forest)" }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Fine print */}
      <p className="font-outfit text-[0.72rem] text-center mt-6 max-w-[340px] leading-relaxed" style={{ color: "var(--ink4)" }}>
        By creating an account you agree to Daloy's{" "}
        <a href="#" className="underline" style={{ color: "var(--ink4)" }}>Terms</a>
        {" "}and{" "}
        <a href="#" className="underline" style={{ color: "var(--ink4)" }}>Privacy Policy</a>.
      </p>
    </div>
  );
}