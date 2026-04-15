import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  PieChart,
  Users,
  Globe,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import AppShowcase from "./AppShowcase";
import ICON_DARK from '../../assets/images/DaloyIconDark.png'
import ICON_LIGHT from '../../assets/images/DaloyIconDark.png'

/* ─────────────────────────────────────────────
   LandingPage.tsx  — v2 Baybayin Edition
   Redesigned to incorporate the Baybayin-inspired
   Daloy icon and Filipino cultural touches.
   Slate & Sage design system preserved.
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

// Filipino financial proverbs / phrases for the hero scroll ticker
const proverbs = [
  "\"Kapag may itinanim, may aanihin.\"",
  "\"Habang maikli ang kumot, matutong mamaluktot.\"",
  "\"Ang hindi marunong mag-ipon, sa hirap aahon.\"",
  "\"Unti-unti, makakarating din sa paroroonan.\"",
  "\"Pag may isinuksok, may madudukot.\"",
  "\"Nasa disiplina ang tunay na yaman, hindi sa laki ng kita.\"",
  "\"Hindi lahat ng kinang ay ginto — maging wais sa paggastos.\"",
  "\"Ang perang pinaghirapan, dapat pinapahalagahan.\"",
];

// ── Component ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerIndex(i => (i + 1) % proverbs.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden font-outfit"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-3.5 md:py-4 border-b transition-all duration-200"
        style={{
          background: scrolled ? "var(--bg)" : "var(--bg)",
          borderColor: scrolled ? "var(--bg3)" : "transparent",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        {/* Logo — icon + wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline"
          style={{ color: "var(--ink)" }}
        >
          <img
            src={ICON_LIGHT}
            alt="Daloy icon"
            className="w-8 h-8 rounded-full object-cover"
            style={{ boxShadow: "0 1px 4px rgba(45,80,22,0.18)" }}
          />
          <span
            className="font-lora font-bold text-[1.2rem] tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            dal<span style={{ color: "var(--forest)" }}>oy</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#showcase"
            className="font-outfit font-normal text-[0.88rem] no-underline transition-opacity hover:opacity-70"
            style={{ color: "var(--ink2)" }}
          >
            Preview
          </a>
          <a
            href="#features"
            className="font-outfit font-normal text-[0.88rem] no-underline transition-opacity hover:opacity-70"
            style={{ color: "var(--ink2)" }}
          >
            Features
          </a>
          <Link
            to="/sign-in"
            className="font-outfit font-normal text-[0.88rem] no-underline transition-opacity hover:opacity-70"
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)]"
          style={{ color: "var(--ink2)" }}
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* ── Mobile menu drawer ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col pt-[60px]"
          style={{ background: "var(--bg)" }}
        >
          <div
            className="flex flex-col px-6 py-8 gap-6 border-b"
            style={{ borderColor: "var(--bg3)" }}
          >
            <a href="#showcase" className="font-outfit font-medium text-[1rem] no-underline" style={{ color: "var(--ink2)" }} onClick={() => setMobileMenuOpen(false)}>Preview</a>
            <a href="#features" className="font-outfit font-medium text-[1rem] no-underline" style={{ color: "var(--ink2)" }} onClick={() => setMobileMenuOpen(false)}>Features</a>
            <Link to="/sign-in" className="font-outfit font-medium text-[1rem] no-underline" style={{ color: "var(--ink2)" }} onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 font-outfit font-medium text-[0.95rem] text-white no-underline px-6 py-3 rounded-[var(--radius-sm)]"
              style={{ background: "var(--forest)" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative max-w-[900px] mx-auto px-6 md:px-8 pt-14 md:pt-24 pb-10 md:pb-16 text-center overflow-hidden">

        {/* Background watermark: large Baybayin D icon, very faint */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <img
            src={ICON_LIGHT}
            alt=""
            className="w-[380px] h-[380px] md:w-[520px] md:h-[520px] object-contain opacity-[0.045]"
            style={{ userSelect: "none" }}
          />
        </div>

        {/* Content sits on top of watermark */}
        <div className="relative z-10">
          {/* Eyebrow with icon */}
          <div className="flex items-center justify-center gap-2.5 mb-5 md:mb-6">
            <img
              src={ICON_LIGHT}
              alt="Daloy"
              className="w-9 h-9 rounded-full object-cover"
              style={{ boxShadow: "0 2px 8px rgba(45,80,22,0.20)" }}
            />
            <span
              className="font-mono font-normal text-[0.62rem] tracking-[0.2em] uppercase"
              style={{ color: "var(--forest-l)" }}
            >
              Personal Finance — Pinoy-first
            </span>
          </div>

          <h1
            className="font-lora font-bold leading-[1.13] tracking-tight mb-5 md:mb-6"
            style={{
              fontSize: "clamp(2rem, 8vw, 3.75rem)",
              color: "var(--ink)",
            }}
          >
            Your money has
            <br />
            <em style={{ color: "var(--forest)" }}>places to be.</em>
          </h1>

          <p
            className="font-outfit font-light text-[0.95rem] md:text-[1.08rem] leading-[1.72] max-w-[520px] mx-auto mb-3"
            style={{ color: "var(--ink3)" }}
          >
            Daloy — <span className="font-outfit italic" style={{ color: "var(--ink2)" }}>flow</span> in Filipino — combines budget tracking,
            group expense splitting, and multi-currency conversion into one calm,
            focused app built for how Filipinos actually manage money.
          </p>

          {/* Baybayin script label — decorative Filipino cultural touch */}
          <p
            className="font-mono text-[0.72rem] mb-8 md:mb-10 tracking-widest"
            style={{ color: "var(--forest-xl)", letterSpacing: "0.22em" }}
          >
            ᜇ · ᜎᜓ · ᜌ᜔ {/* Baybayin: da-lu-y */}
          </p>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 font-outfit font-medium text-[0.9rem] text-white no-underline px-8 py-3 rounded-[var(--radius-sm)] transition-colors"
              style={{ background: "var(--forest)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-m)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--forest)")}
            >
              Start for free <ArrowRight size={15} />
            </Link>
            <a
              href="#showcase"
              className="inline-block font-outfit font-normal text-[0.9rem] no-underline px-8 py-3 rounded-[var(--radius-sm)] border-[1.5px] transition-colors"
              style={{ color: "var(--forest)", borderColor: "var(--forest-xl)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--forest-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              See it in action
            </a>
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden flex flex-col gap-3">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 font-outfit font-medium text-[0.95rem] text-white no-underline px-6 py-3.5 rounded-[var(--radius-sm)]"
              style={{ background: "var(--forest)" }}
            >
              Start for free <ArrowRight size={15} />
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center justify-center font-outfit font-normal text-[0.88rem] no-underline px-6 py-3 rounded-[var(--radius-sm)] border-[1.5px]"
              style={{ color: "var(--forest)", borderColor: "var(--forest-xl)" }}
            >
              See it in action
            </a>
          </div>
        </div>
      </section>

      {/* ── Filipino Proverb Ticker ── */}
      <div
        className="border-t border-b px-6 md:px-8 py-4 overflow-hidden"
        style={{ background: "var(--bg2)", borderColor: "var(--bg3)" }}
      >
        <div className="max-w-[700px] mx-auto text-center min-h-[1.5rem] flex items-center justify-center">
          <p
            key={tickerIndex}
            className="font-lora italic font-normal text-[0.85rem] md:text-[0.92rem] leading-[1.6] transition-all duration-500"
            style={{
              color: "var(--ink3)",
              animation: "fadeSlideIn 0.5s ease forwards",
            }}
          >
            {proverbs[tickerIndex]}
          </p>
        </div>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ── Filipino Color Band — subtle sash motif ── */}
      {/*
        The Philippine flag colors (blue, red, white) rendered as a
        very thin decorative accent strip, paying homage to Filipino roots.
        Kept extremely subtle to not clash with the Slate & Sage palette.
      */}
      <div className="flex h-[3px]" aria-hidden="true">
        <div className="flex-1" style={{ background: "var(--steel-m)", opacity: 0.45 }} />
        <div className="flex-1" style={{ background: "var(--bg3)", opacity: 0.7 }} />
        <div className="flex-1" style={{ background: "var(--clay-m)", opacity: 0.45 }} />
      </div>

      {/* ── App Showcase ── */}
      <AppShowcase />

      {/* ── "What Daloy Means" cultural section ── */}
      <section
        className="border-t border-b px-6 md:px-8 py-12 md:py-16"
        style={{ background: "var(--bg)", borderColor: "var(--bg3)" }}
      >
        <div className="max-w-[820px] mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14">

          {/* Icon — large, proudly displayed */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <img
              src={ICON_DARK}
              alt="Daloy Baybayin icon"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover"
              style={{ boxShadow: "var(--shadow-md)" }}
            />
            <span
              className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-center"
              style={{ color: "var(--ink4)" }}
            >
              Baybayin · ᜇ
            </span>
          </div>

          {/* Text */}
          <div>
            <span
              className="font-mono font-normal text-[0.62rem] tracking-[0.18em] uppercase block mb-3"
              style={{ color: "var(--forest-l)" }}
            >
              The Name & The Mark
            </span>
            <h2
              className="font-lora font-semibold text-[1.4rem] md:text-[1.65rem] tracking-tight mb-4"
              style={{ color: "var(--ink)" }}
            >
              More than a word. It's a worldview.
            </h2>
            <p
              className="font-outfit font-light text-[0.9rem] md:text-[0.95rem] leading-[1.72] mb-3"
              style={{ color: "var(--ink3)" }}
            >
              <strong className="font-medium" style={{ color: "var(--ink2)" }}>Daloy</strong> is the Filipino word for <em>flow</em> — the steady,
              purposeful movement of something from one place to another.
              We chose it because that's exactly what healthy finances look like:
              money flowing with intention, not just disappearing.
            </p>
            <p
              className="font-outfit font-light text-[0.9rem] md:text-[0.95rem] leading-[1.72]"
              style={{ color: "var(--ink3)" }}
            >
              The icon is a stylized <strong className="font-medium" style={{ color: "var(--ink2)" }}>ᜇ (Da)</strong> in Baybayin —
              the pre-colonial Philippine script. A quiet nod to the roots of Filipino
              culture, rendered in forest green for growth and grounding.
            </p>

            {/* Baybayin characters display */}
            <div className="flex items-center gap-3 mt-5">
              {["ᜇ","ᜎᜓ","ᜌ᜔"].map((char, i) => (
                <div key={i} className="text-center">
                  <span
                    className="block text-[1.5rem] leading-none mb-0.5"
                    style={{ color: "var(--forest)" }}
                  >
                    {char}
                  </span>
                  <span
                    className="font-mono text-[0.52rem] tracking-wider uppercase"
                    style={{ color: "var(--ink4)" }}
                  >
                    {["da","lo","y"][i]}
                  </span>
                </div>
              ))}
              <div className="ml-2">
                <span
                  className="font-lora italic text-[0.82rem]"
                  style={{ color: "var(--ink3)" }}
                >
                  ← "daloy" in Baybayin
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-[1040px] mx-auto px-6 md:px-8 py-14 md:py-20">
        <span
          className="font-mono font-normal text-[0.65rem] tracking-[0.18em] uppercase block mb-3"
          style={{ color: "var(--ink4)" }}
        >
          What Daloy does
        </span>
        <h2
          className="font-lora font-semibold text-[1.5rem] md:text-[1.8rem] tracking-tight mb-8 md:mb-12"
          style={{ color: "var(--ink)" }}
        >
          Everything in one flow.
        </h2>

        <div
          className="grid gap-4 md:gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}
        >
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="border rounded-[var(--radius-xl)] p-6 md:p-8 group transition-all duration-200"
              style={{
                background: "var(--bg2)",
                borderColor: "var(--bg3)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--forest-xl)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--forest-bg)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--bg3)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg2)";
              }}
            >
              <div
                className="w-[40px] h-[40px] md:w-[42px] md:h-[42px] rounded-[var(--radius-md)] flex items-center justify-center mb-4 md:mb-5"
                style={{ background: "var(--forest-bg)", color: "var(--forest)" }}
              >
                <Icon size={19} strokeWidth={1.75} />
              </div>
              <p className="font-outfit font-semibold text-[0.95rem] mb-2" style={{ color: "var(--ink)" }}>
                {title}
              </p>
              <p className="font-outfit font-light text-[0.875rem] leading-[1.65]" style={{ color: "var(--ink3)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="border-t border-b px-6 md:px-8 py-12 md:py-16"
        style={{ background: "var(--bg2)", borderColor: "var(--bg3)" }}
      >
        <div className="max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center">
          {[
            { number: "₱0",   label: "Cost, forever free tier" },
            { number: "150+", label: "Currencies supported" },
            { number: "∞",    label: "Wallets you can track" },
            { number: "1",    label: "App for all of it" },
          ].map(({ number, label }) => (
            <div key={label}>
              <span
                className="font-mono font-medium text-[1.75rem] md:text-[2rem] block mb-1.5"
                style={{ color: "var(--forest)" }}
              >
                {number}
              </span>
              <span
                className="font-outfit font-normal text-[0.78rem] md:text-[0.83rem]"
                style={{ color: "var(--ink3)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Made for Filipinos ── */}
      <section className="max-w-[820px] mx-auto px-6 md:px-8 py-14 md:py-20">
        <div
          className="rounded-[var(--radius-xl)] border p-8 md:p-12 relative overflow-hidden"
          style={{ background: "var(--forest-bg)", borderColor: "var(--forest-xl)" }}
        >
          {/* Decorative background icon */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none" aria-hidden="true">
            <img
              src={ICON_LIGHT}
              alt=""
              className="w-40 h-40 md:w-52 md:h-52 object-contain opacity-[0.08]"
              style={{ transform: "translate(20%, 20%)" }}
            />
          </div>

          <span
            className="font-mono font-normal text-[0.62rem] tracking-[0.18em] uppercase block mb-3"
            style={{ color: "var(--forest-l)" }}
          >
            Made for Filipinos
          </span>
          <h2
            className="font-lora font-bold text-[1.5rem] md:text-[2rem] tracking-tight mb-4"
            style={{ color: "var(--forest)" }}
          >
            Built around how we actually live.
          </h2>
          <p
            className="font-outfit font-light text-[0.9rem] md:text-[1rem] leading-[1.72] mb-6 max-w-[520px]"
            style={{ color: "var(--ink2)" }}
          >
            From GCash and Maya to paluwagan tracking and suki tabs —
            Daloy understands the Filipino financial reality. PHP is the base.
            The experience is local. The philosophy is universal.
          </p>

          {/* Wallet tags */}
          <div className="flex flex-wrap gap-2">
            {["GCash","Maya","BPI","BDO","Cash","Paluwagan","Utang tracker"].map(tag => (
              <span
                key={tag}
                className="font-outfit font-normal text-[0.75rem] px-3 py-1 rounded-full border"
                style={{
                  color: "var(--forest)",
                  borderColor: "var(--forest-xl)",
                  background: "rgba(255,255,255,0.5)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — desktop ── */}
      <section className="hidden md:block max-w-[600px] mx-auto px-8 pb-24 text-center">
        {/* Icon above CTA */}
        <div className="flex justify-center mb-5">
          <img
            src={ICON_DARK}
            alt="Daloy"
            className="w-14 h-14 rounded-full object-cover"
            style={{ boxShadow: "var(--shadow-md)" }}
          />
        </div>
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

      {/* ── Final CTA — mobile ── */}
      <section className="md:hidden px-6 pb-12 text-center">
        <div className="flex justify-center mb-4">
          <img src={ICON_DARK} alt="Daloy" className="w-12 h-12 rounded-full object-cover" style={{ boxShadow: "var(--shadow-md)" }} />
        </div>
        <h2 className="font-lora font-bold text-[1.6rem] tracking-tight mb-3" style={{ color: "var(--ink)" }}>
          Ready to see where it goes?
        </h2>
        <p className="font-outfit font-light text-[0.9rem] leading-[1.6] mb-6" style={{ color: "var(--ink3)" }}>
          Create your account in under a minute. No credit card required.
        </p>
        <Link
          to="/sign-up"
          className="inline-flex items-center justify-center gap-2 font-outfit font-medium text-[0.95rem] text-white no-underline w-full max-w-[340px] py-3.5 rounded-[var(--radius-sm)]"
          style={{ background: "var(--forest)" }}
        >
          Create free account <ArrowRight size={15} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-6 md:px-10 py-6 md:py-8"
        style={{ borderColor: "var(--bg3)" }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="flex items-center gap-2 no-underline" style={{ color: "var(--ink)" }}>
            <img src={ICON_LIGHT} alt="" className="w-6 h-6 rounded-full object-cover" />
            <span className="font-lora font-bold text-[1rem]">daloy</span>
          </Link>
          <span className="font-outfit font-normal text-[0.78rem]" style={{ color: "var(--ink4)" }}>
            © {new Date().getFullYear()} Daloy. Built with intention.
          </span>
          <div className="flex gap-6">
            <a href="#" className="font-outfit font-normal text-[0.78rem] no-underline hover:opacity-70" style={{ color: "var(--ink4)" }}>Privacy</a>
            <a href="#" className="font-outfit font-normal text-[0.78rem] no-underline hover:opacity-70" style={{ color: "var(--ink4)" }}>Terms</a>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col items-center gap-4 text-center">
          <Link to="/" className="flex items-center gap-2 no-underline" style={{ color: "var(--ink)" }}>
            <img src={ICON_LIGHT} alt="" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-lora font-bold text-[1.1rem]">daloy</span>
          </Link>
          <div className="flex gap-6">
            <a href="#" className="font-outfit font-normal text-[0.78rem] no-underline" style={{ color: "var(--ink4)" }}>Privacy</a>
            <a href="#" className="font-outfit font-normal text-[0.78rem] no-underline" style={{ color: "var(--ink4)" }}>Terms</a>
          </div>
          <span className="font-outfit font-normal text-[0.72rem]" style={{ color: "var(--ink4)" }}>
            © {new Date().getFullYear()} Daloy. Built with intention.
          </span>
        </div>
      </footer>

    </div>
  );
}