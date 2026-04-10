import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import type { AxiosError } from "axios";
import apiClient from "../../services/apiClient";

/* ─────────────────────────────────────────────
   ConfirmEmailPage.tsx
   Mounted at /confirm-email.
   Reads ?token= from URL, calls GET /api/auth/confirm-email,
   then shows success (auto-redirect to /sign-in) or error state.

   Edge cases handled:
   - No token in URL → immediate error state
   - Token already used (user refreshed after confirm) → "already confirmed" state
   - React Strict Mode double-invoke → hasRun ref guard (sole guard — no cancelled flag)
───────────────────────────────────────────── */

type Status = "loading" | "success" | "already-confirmed" | "error";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus]   = useState<Status>("loading");
  const [message, setMessage] = useState("");

  // Sole guard against React Strict Mode's double-invoke.
  // Previously we also had a `cancelled` flag tied to effect cleanup —
  // but Strict Mode unmounts and remounts, setting cancelled=true before
  // the request resolves, while hasRun prevents the second effect from
  // re-issuing the request. The result: a permanently pending promise
  // whose setStatus call is swallowed. Fix: drop `cancelled`, trust hasRun.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setStatus("error");
      setMessage("No token found in this link. Please use the link from your confirmation email.");
      return;
    }

    apiClient
      .get(`/api/auth/confirm-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email is confirmed. Redirecting you to sign in…");
        // Replace history so the user can't navigate back to this consumed token URL
        setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
      })
      .catch((err: AxiosError<{ message?: string }>) => {
        const serverMessage =
          err?.response?.data?.message ??
          err?.message ??
          "This link is invalid or has expired.";

        // Token was already consumed — user refreshed the page after a successful
        // confirm. Show a friendly "already confirmed" state instead of a scary error.
        if (
          serverMessage.toLowerCase().includes("invalid or expired") ||
          serverMessage.toLowerCase().includes("already confirmed")
        ) {
          setStatus("already-confirmed");
        } else {
          setStatus("error");
          setMessage(serverMessage);
        }
      });

    // No cleanup / cancelled flag — hasRun ref is the single source of truth.
    // Adding a cleanup that sets cancelled=true would race against Strict Mode's
    // unmount and silently swallow the request result.
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-[420px] border rounded-[var(--radius-xl)] px-8 py-10 text-center"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--bg3)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-lora font-bold text-[1.25rem] tracking-tight no-underline block mb-10"
          style={{ color: "var(--ink)" }}
        >
          dal<span style={{ color: "var(--forest)" }}>oy</span>
        </Link>

        {/* ── Loading ── */}
        {status === "loading" && (
          <>
            <div
              className="mx-auto mb-5"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "3px solid var(--bg3)",
                borderTopColor: "var(--forest)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="font-outfit text-[0.9rem]" style={{ color: "var(--ink3)" }}>
              Confirming your email…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <CheckCircle2
              size={44}
              className="mx-auto mb-5"
              style={{ color: "var(--income)" }}
            />
            <h1
              className="font-lora font-bold text-[1.5rem] tracking-tight mb-2"
              style={{ color: "var(--ink)" }}
            >
              You're confirmed!
            </h1>
            <p className="font-outfit text-[0.875rem]" style={{ color: "var(--ink3)" }}>
              {message}
            </p>
          </>
        )}

        {/* ── Already confirmed (token consumed, user refreshed) ── */}
        {status === "already-confirmed" && (
          <>
            <CheckCircle2
              size={44}
              className="mx-auto mb-5"
              style={{ color: "var(--income)" }}
            />
            <h1
              className="font-lora font-bold text-[1.5rem] tracking-tight mb-2"
              style={{ color: "var(--ink)" }}
            >
              Already confirmed!
            </h1>
            <p
              className="font-outfit text-[0.875rem] mb-7"
              style={{ color: "var(--ink3)" }}
            >
              Your email is already verified. You can sign in to your account.
            </p>
            <button
              onClick={() => navigate("/sign-in", { replace: true })}
              className="font-outfit font-medium text-[0.875rem] text-white rounded-[var(--radius-sm)] py-[0.7rem] px-6 transition-colors"
              style={{ background: "var(--forest)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--forest-m)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
            >
              Go to sign in
            </button>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <XCircle
              size={44}
              className="mx-auto mb-5"
              style={{ color: "var(--expense)" }}
            />
            <h1
              className="font-lora font-bold text-[1.5rem] tracking-tight mb-2"
              style={{ color: "var(--ink)" }}
            >
              Link invalid
            </h1>
            <p
              className="font-outfit text-[0.875rem] mb-7"
              style={{ color: "var(--ink3)" }}
            >
              {message}
            </p>
            <button
              onClick={() => navigate("/sign-up")}
              className="font-outfit font-medium text-[0.875rem] text-white rounded-[var(--radius-sm)] py-[0.7rem] px-6 transition-colors"
              style={{ background: "var(--forest)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--forest-m)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--forest)"; }}
            >
              Back to sign up
            </button>
          </>
        )}
      </div>

      {/* Fine print */}
      <p
        className="font-outfit text-[0.72rem] text-center mt-6 max-w-[340px] leading-relaxed"
        style={{ color: "var(--ink4)" }}
      >
        Questions? Contact us at{" "}
        <a
          href="mailto:support@daloy-finance.online"
          className="underline"
          style={{ color: "var(--ink4)" }}
        >
          support@daloy-finance.online
        </a>
      </p>
    </div>
  );
}