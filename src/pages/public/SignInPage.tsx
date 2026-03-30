import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
//import { signIn, signInWithGoogle } from "../../services/authService";

/* ─────────────────────────────────────────────
   SignInPage.tsx
   Public auth page — email/password + Google OAuth.
   Redirects to /home on success, /onboarding if
   onboarding_done = false (handled in authService).
───────────────────────────────────────────── */

// ── Google icon (SVG inline — no extra dep) ──
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignInPage() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Email / password sign-in ──────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      //await signIn(email, password);
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth ──────────────────────────────
  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      //await signInWithGoogle();
      // Supabase redirects back; no navigate() needed here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
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
          Welcome back.
        </h1>
        <p
          className="font-outfit font-light text-[0.9rem] mb-8"
          style={{ color: "var(--ink3)" }}
        >
          Sign in to pick up where you left off.
        </p>

        {/* ── Google button ── */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 font-outfit font-medium text-[0.875rem] border-[1.5px] rounded-[var(--radius-sm)] py-[0.7rem] px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          style={{
            color: "var(--ink2)",
            borderColor: "var(--bg3)",
            background: "var(--bg)",
          }}
          onMouseEnter={e => { if (!googleLoading && !loading) e.currentTarget.style.borderColor = "var(--forest-xl)"; }}
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
          <span
            className="font-mono text-[0.65rem] tracking-[0.12em] uppercase"
            style={{ color: "var(--ink4)" }}
          >
            or
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--bg3)" }} />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Error banner */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-[var(--radius-md)] px-4 py-3 text-[0.83rem] font-outfit"
              style={{
                background: "#FBF0F0",
                border: "1px solid #E8B5B5",
                color: "var(--expense)",
              }}
            >
              <AlertCircle size={15} className="mt-[1px] shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-outfit font-medium text-[0.78rem]"
              style={{ color: "var(--ink2)" }}
            >
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
              style={{
                background: "var(--bg)",
                border: "1.5px solid var(--bg3)",
                color: "var(--ink)",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-outfit font-medium text-[0.78rem]"
                style={{ color: "var(--ink2)" }}
              >
                Password
              </label>
              <a
                href="#"
                className="font-outfit text-[0.75rem] no-underline hover:underline"
                style={{ color: "var(--forest)" }}
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full font-outfit text-[0.875rem] rounded-[var(--radius-sm)] px-3.5 py-[0.65rem] pr-11 outline-none transition-colors"
                style={{
                  background: "var(--bg)",
                  border: "1.5px solid var(--bg3)",
                  color: "var(--ink)",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--forest-m)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "var(--bg3)"; }}
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 font-outfit font-medium text-[0.875rem] text-white rounded-[var(--radius-sm)] py-[0.7rem] mt-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--forest)" }}
            onMouseEnter={e => { if (!loading && !googleLoading) e.currentTarget.style.background = "var(--forest-m)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
          >
            {loading
              ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <>Sign in <ArrowRight size={14} /></>
            }
          </button>
        </form>

        {/* Footer link */}
        <p
          className="font-outfit font-light text-[0.83rem] text-center mt-6"
          style={{ color: "var(--ink3)" }}
        >
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium no-underline hover:underline"
            style={{ color: "var(--forest)" }}
          >
            Create one
          </Link>
        </p>

      </div>

      {/* Fine print */}
      <p
        className="font-outfit text-[0.72rem] text-center mt-6 max-w-[340px] leading-relaxed"
        style={{ color: "var(--ink4)" }}
      >
        By signing in you agree to Daloy's{" "}
        <a href="#" className="underline" style={{ color: "var(--ink4)" }}>Terms</a>
        {" "}and{" "}
        <a href="#" className="underline" style={{ color: "var(--ink4)" }}>Privacy Policy</a>.
      </p>
    </div>
  );
}