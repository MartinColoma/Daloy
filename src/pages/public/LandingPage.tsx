import { Link } from "react-router-dom";
import {  Wallet,  PieChart,  Users,  Globe,  TrendingUp,  ShieldCheck,  ArrowRight,  type LucideIcon,} from "lucide-react";

/* ─────────────────────────────────────────────
   LandingPage.tsx
   Public marketing page for Daloy.
   Styled with Tailwind CSS v4 + CSS variables from index.css.
   Fonts: Lora | Outfit | IBM Plex Mono (Google Fonts in index.html)
───────────────────────────────────────────── */

// ── Feature data ──────────────────────────────────────────────────
interface Feature {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    Icon: Wallet,
    title: "Track every peso",
    desc: "Log income, expenses, and transfers across all your wallets — GCash, Maya, BPI, cash, and more.",
  },
  {
    Icon: PieChart,
    title: "Budgets that flex",
    desc: "Set envelope-style budgets per category. Watch the bar turn red before you're in trouble.",
  },
  {
    Icon: Users,
    title: "Split without awkward",
    desc: "Group expenses, shared tabs, and debt tracking — all settled in a tap. No more memory games.",
  },
  {
    Icon: Globe,
    title: "Multi-currency ready",
    desc: "Log in USD, SGD, or JPY. Daloy converts at live rates and keeps your base always in PHP.",
  },
  {
    Icon: TrendingUp,
    title: "Insights that make sense",
    desc: "See where your money flows each month. 50/30/20 health check, category breakdowns, savings rate.",
  },
  {
    Icon: ShieldCheck,
    title: "Your data, secured",
    desc: "Built on Supabase — row-level security from day one. No ads. No selling your data. Ever.",
  },
];

// ── Component ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden font-outfit"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b"
        style={{
          background: "var(--bg)",
          borderColor: "var(--bg3)",
        }}
      >
        <Link
          to="/"
          className="font-lora font-bold text-[1.35rem] tracking-tight no-underline"
          style={{ color: "var(--ink)" }}
        >
          Dalo<span style={{ color: "var(--forest)" }}>y</span>
        </Link>

        <div className="flex items-center gap-8">
          <a
            href="#features"
            className="font-outfit font-normal text-[0.88rem] no-underline transition-colors hover:opacity-80"
            style={{ color: "var(--ink2)" }}
          >
            Features
          </a>
          <Link
            to="/sign-in"
            className="font-outfit font-normal text-[0.88rem] no-underline transition-colors hover:opacity-80"
            style={{ color: "var(--ink2)" }}
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="font-outfit font-medium text-[0.85rem] text-white no-underline px-5 py-2 rounded-[var(--radius-sm)] transition-colors"
            style={{ background: "var(--forest)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-m)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--forest)")}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[860px] mx-auto px-8 pt-24 pb-20 text-center">
        <span
          className="font-mono font-normal text-[0.65rem] tracking-[0.18em] uppercase block mb-5"
          style={{ color: "var(--forest-l)" }}
        >
          Personal Finance — Simplified
        </span>

        <h1
          className="font-lora font-bold leading-[1.15] tracking-tight mb-5"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
            color: "var(--ink)",
          }}
        >
          Your money has
          <br />
          <em style={{ color: "var(--forest)" }}>places to be.</em>
        </h1>

        <p
          className="font-outfit font-light text-[1.1rem] leading-[1.7] max-w-[540px] mx-auto mb-10"
          style={{ color: "var(--ink3)" }}
        >
          Daloy combines budget tracking, group expense splitting, and
          multi-currency conversion into one calm, focused app — built
          for how Filipinos actually manage money.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 font-outfit font-medium text-[0.9rem] text-white no-underline px-8 py-3 rounded-[var(--radius-sm)] transition-colors"
            style={{ background: "var(--forest)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-m)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--forest)")}
          >
            Start for free <ArrowRight size={15} />
          </Link>
          <Link
            to="/sign-in"
            className="inline-block font-outfit font-normal text-[0.9rem] no-underline px-8 py-3 rounded-[var(--radius-sm)] border-[1.5px] transition-colors"
            style={{
              color: "var(--forest)",
              borderColor: "var(--forest-xl)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            I have an account
          </Link>
        </div>
      </section>

      {/* ── Tagline strip ── */}
      <div
        className="border-t border-b px-8 py-4 text-center"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--bg3)",
        }}
      >
        <p
          className="font-lora italic font-normal text-[1.05rem] tracking-[0.01em]"
          style={{ color: "var(--ink3)" }}
        >
          "Track it. Split it. Understand it."
        </p>
      </div>

      {/* ── Features ── */}
      <section id="features" className="max-w-[1040px] mx-auto px-8 py-20">
        <span
          className="font-mono font-normal text-[0.65rem] tracking-[0.18em] uppercase block mb-3"
          style={{ color: "var(--ink4)" }}
        >
          What Daloy does
        </span>
        <h2
          className="font-lora font-semibold text-[1.8rem] tracking-tight mb-12"
          style={{ color: "var(--ink)" }}
        >
          Everything in one flow.
        </h2>

        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="border rounded-[var(--radius-xl)] p-8"
              style={{
                background: "var(--bg2)",
                borderColor: "var(--bg3)",
              }}
            >
              <div
                className="w-[42px] h-[42px] rounded-[var(--radius-md)] flex items-center justify-center mb-5"
                style={{
                  background: "var(--forest-bg)",
                  color: "var(--forest)",
                }}
              >
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <p
                className="font-outfit font-semibold text-[0.95rem] mb-2"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </p>
              <p
                className="font-outfit font-light text-[0.875rem] leading-[1.65]"
                style={{ color: "var(--ink3)" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="border-t border-b px-8 py-16"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--bg3)",
        }}
      >
        <div
          className="max-w-[800px] mx-auto grid gap-10 text-center"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
        >
          {[
            { number: "₱0",   label: "Cost, forever free tier" },
            { number: "150+", label: "Currencies supported" },
            { number: "∞",    label: "Wallets you can track" },
            { number: "1",    label: "App for all of it" },
          ].map(({ number, label }) => (
            <div key={label}>
              <span
                className="font-mono font-medium text-[2rem] block mb-1.5"
                style={{ color: "var(--forest)" }}
              >
                {number}
              </span>
              <span
                className="font-outfit font-normal text-[0.83rem]"
                style={{ color: "var(--ink3)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-[600px] mx-auto px-8 py-24 text-center">
        <h2
          className="font-lora font-bold text-[2rem] tracking-tight mb-4"
          style={{ color: "var(--ink)" }}
        >
          Ready to see where it goes?
        </h2>
        <p
          className="font-outfit font-light text-[0.95rem] leading-[1.6] mb-8"
          style={{ color: "var(--ink3)" }}
        >
          Create your account in under a minute. No credit card required.
          Start tracking the day you sign up.
        </p>
        <Link
          to="/sign-up"
          className="inline-flex items-center gap-2 font-outfit font-medium text-[0.9rem] text-white no-underline px-8 py-3 rounded-[var(--radius-sm)] transition-colors"
          style={{ background: "var(--forest)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-m)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--forest)")}
        >
          Create free account <ArrowRight size={15} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-8 py-8 flex items-center justify-between flex-wrap gap-4"
        style={{ borderColor: "var(--bg3)" }}
      >
        <Link
          to="/"
          className="font-lora font-bold text-[1rem] no-underline"
          style={{ color: "var(--ink)" }}
        >
          daloy
        </Link>
        <span
          className="font-outfit font-normal text-[0.78rem]"
          style={{ color: "var(--ink4)" }}
        >
          © {new Date().getFullYear()} Daloy. Built with intention.
        </span>
        <div className="flex gap-6">
          <a
            href="#"
            className="font-outfit font-normal text-[0.78rem] no-underline hover:opacity-70 transition-opacity"
            style={{ color: "var(--ink4)" }}
          >
            Privacy
          </a>
          <a
            href="#"
            className="font-outfit font-normal text-[0.78rem] no-underline hover:opacity-70 transition-opacity"
            style={{ color: "var(--ink4)" }}
          >
            Terms
          </a>
        </div>
      </footer>

    </div>
  );
}