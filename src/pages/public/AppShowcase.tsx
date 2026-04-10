/* ─────────────────────────────────────────────────────────────────
   AppShowcase.tsx
   Drop-in section for LandingPage.tsx — replaces or supplements
   the existing Features section with an interactive visual showcase.

   Usage:
     import AppShowcase from "@/components/landing/AppShowcase";
     <AppShowcase />

   Depends on: Lora | Outfit | IBM Plex Mono (already in index.html)
   CSS variables already declared in index.css
   No external deps beyond lucide-react (already a project dep).
─────────────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef } from "react";

// ─── tiny hook: fires once when element enters viewport ──────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Feature pill data ───────────────────────────────────────────
const pills = [
  { emoji: "💸", label: "Expense tracking" },
  { emoji: "📊", label: "Budget envelopes" },
  { emoji: "👥", label: "Group splitting" },
  { emoji: "🌏", label: "Multi-currency" },
  { emoji: "📈", label: "Insights" },
];

// ─────────────────────────────────────────────────────────────────
// MOBILE MOCKUP — cloned 1:1 from HTML reference
// ─────────────────────────────────────────────────────────────────
const MobileMockup = () => (
  <div
    style={{
      position: "relative",
      width: 260,
      filter: "drop-shadow(0 24px 48px rgba(28,26,23,0.18))",
      flexShrink: 0,
    }}
  >
    {/* Phone frame */}
    <div
      style={{
        width: 260,
        background: "#1C1A17",
        borderRadius: 36,
        padding: "14px 10px",
        boxSizing: "border-box",
      }}
    >
      {/* Notch */}
      <div
        style={{
          width: 72,
          height: 10,
          background: "#1C1A17",
          borderRadius: "0 0 8px 8px",
          margin: "0 auto 8px",
        }}
      />
      {/* Screen */}
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 26,
          overflow: "hidden",
          height: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            padding: "12px 14px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontWeight: 700,
              fontSize: 15,
              color: "var(--ink)",
            }}
          >
            dal<span style={{ color: "var(--forest)" }}>oy</span>
          </span>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--forest-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--forest)",
            }}
          >
            MC
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            scrollbarWidth: "none",
          }}
        >
          {/* Greeting */}
          <div>
            <p style={{ fontSize: 9, color: "var(--ink4)", margin: 0 }}>
              Good morning,
            </p>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Morphy.
            </p>
          </div>

          {/* Hero card */}
          <div
            style={{
              background: "var(--ink)",
              borderRadius: 14,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Net Balance
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                ₱42,850.00
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--forest-xl)",
                  }}
                />
                <span style={{ fontSize: 8.5, color: "var(--forest-xl)" }}>
                  +₱3,200.00 vs last month
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["Income", "₱35,000.00"],
                ["Expenses", "₱18,420.00"],
              ].map(([lbl, val]) => (
                <div
                  key={lbl}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "7px 8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 7,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.32)",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {lbl}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#fff",
                      marginTop: 2,
                    }}
                  >
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wallets */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Wallets
              </span>
              <span style={{ fontSize: 8.5, color: "var(--forest)" }}>
                Manage →
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 7,
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: 2,
              }}
            >
              {(
                [
                  ["💵 Cash", "₱5,200", "#5C4033"],
                  ["📱 GCash", "₱12,450", "#005CFF"],
                  ["🍃 Maya", "₱8,700", "#2D8653"],
                  ["🏦 BPI", "₱16,500", "#CC0000"],
                ] as [string, string, string][]
              ).map(([name, amt, bg]) => (
                <div
                  key={name}
                  style={{
                    flexShrink: 0,
                    borderRadius: 10,
                    padding: "8px 10px",
                    minWidth: 90,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 56,
                    background: bg,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    {name}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#fff",
                        marginTop: 4,
                      }}
                    >
                      {amt}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 7,
                        color: "rgba(255,255,255,0.38)",
                        marginTop: 1,
                      }}
                    >
                      PHP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budgets */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Budgets
              </span>
              <span style={{ fontSize: 8.5, color: "var(--forest)" }}>
                View all
              </span>
            </div>
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {(
                [
                  {
                    icon: "🛒",
                    name: "Groceries",
                    spent: 3200,
                    limit: 5000,
                    pct: 64,
                    color: "#4F8A2B",
                    over: false,
                    remaining: "₱1,800 remaining",
                    remainColor: "var(--ink4)",
                  },
                  {
                    icon: "🍔",
                    name: "Food & Dining",
                    spent: 3750,
                    limit: 4000,
                    pct: 94,
                    color: "#C4913A",
                    over: false,
                    remaining: "₱250 remaining",
                    remainColor: "#C4913A",
                  },
                  {
                    icon: "🚌",
                    name: "Transport",
                    spent: 2100,
                    limit: 2500,
                    pct: 84,
                    color: "#C4913A",
                    over: false,
                    remaining: "₱400 remaining",
                    remainColor: "var(--ink4)",
                  },
                  {
                    icon: "🎮",
                    name: "Entertainment",
                    spent: 1650,
                    limit: 1500,
                    pct: 100,
                    color: "#8B2E2E",
                    over: true,
                    remaining: "Over by ₱150",
                    remainColor: "#8B2E2E",
                  },
                ] as {
                  icon: string;
                  name: string;
                  spent: number;
                  limit: number;
                  pct: number;
                  color: string;
                  over: boolean;
                  remaining: string;
                  remainColor: string;
                }[]
              ).map(({ icon, name, spent, limit, pct, color, over, remaining, remainColor }) => (
                <div
                  key={name}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid var(--bg3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 500,
                        color: "var(--ink2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {icon} {name}
                      {over && (
                        <span
                          style={{
                            background: "#FEE2E2",
                            color: "#8B2E2E",
                            fontSize: 6.5,
                            padding: "1px 4px",
                            borderRadius: 3,
                            fontWeight: 600,
                          }}
                        >
                          OVER
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 7.5,
                        color: "var(--ink4)",
                      }}
                    >
                      ₱{spent.toLocaleString()}/₱{limit.toLocaleString()}
                    </span>
                  </div>
                  {/* Bar */}
                  <div
                    style={{
                      height: 5,
                      borderRadius: 100,
                      background: "var(--bg3)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 100,
                        width: `${pct}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: remainColor,
                      marginTop: 3,
                    }}
                  >
                    {remaining}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                Recent
              </span>
              <span style={{ fontSize: 8.5, color: "var(--forest)" }}>
                View all →
              </span>
            </div>
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              {/* Date header */}
              <div
                style={{
                  padding: "3px 10px",
                  background: "var(--bg3)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 7,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                }}
              >
                Today · APR 10
              </div>
              {(
                [
                  ["☕", "Starbucks", "Food & Dining · GCash", "−₱220.00", "#8B2E2E"],
                  ["💼", "Freelance - Client A", "Income · BPI", "+₱15,000.00", "#2D6A4F"],
                ] as [string, string, string, string, string][]
              ).map(([icon, desc, sub, amt, color]) => (
                <div
                  key={desc}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderBottom: "1px solid var(--bg3)",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
                      background: "var(--bg3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 8.5,
                        fontWeight: 500,
                        color: "var(--ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {desc}
                    </div>
                    <div style={{ fontSize: 7, color: "var(--ink4)" }}>{sub}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 8.5,
                      fontWeight: 500,
                      color,
                      textAlign: "right",
                    }}
                  >
                    {amt}
                  </div>
                </div>
              ))}

              {/* Date header — yesterday */}
              <div
                style={{
                  padding: "3px 10px",
                  background: "var(--bg3)",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 7,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                }}
              >
                Yesterday · APR 9
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 10px",
                  borderBottom: "1px solid var(--bg3)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: "var(--bg3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  🛒
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 500,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    SM Supermarket
                  </div>
                  <div style={{ fontSize: 7, color: "var(--ink4)" }}>
                    Groceries · Maya
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 8.5,
                    fontWeight: 500,
                    color: "#8B2E2E",
                    textAlign: "right",
                  }}
                >
                  −₱1,240.00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom nav — 5 items matching HTML ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            padding: "6px 8px 10px",
            background: "var(--bg)",
            borderTop: "1px solid var(--bg3)",
            flexShrink: 0,
          }}
        >
          {/* Home */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--forest)"
              strokeWidth={2}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span
              style={{
                fontSize: 7,
                color: "var(--forest)",
                fontWeight: 600,
              }}
            >
              Home
            </span>
          </div>

          {/* Wallet */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink4)"
              strokeWidth={2}
            >
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span style={{ fontSize: 7, color: "var(--ink4)" }}>Wallet</span>
          </div>

          {/* FAB */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "var(--forest)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 2,
              }}
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>

          {/* History */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink4)"
              strokeWidth={2}
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span style={{ fontSize: 7, color: "var(--ink4)" }}>History</span>
          </div>

          {/* Profile */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink4)"
              strokeWidth={2}
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span style={{ fontSize: 7, color: "var(--ink4)" }}>Profile</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Desktop mockup (unchanged) ──────────────────────────────────
const DesktopMockup = () => (
  <div
    style={{
      width: "100%",
      maxWidth: 600,
      background: "var(--bg)",
      border: "1px solid var(--bg3)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow:
        "0 24px 56px rgba(28,26,23,0.14), 0 0 0 1px rgba(28,26,23,0.06)",
    }}
  >
    {/* Browser chrome */}
    <div
      style={{
        background: "var(--bg2)",
        borderBottom: "1px solid var(--bg3)",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
        <div
          key={c}
          style={{ width: 8, height: 8, borderRadius: "50%", background: c }}
        />
      ))}
      <div
        style={{
          flex: 1,
          margin: "0 8px",
          background: "var(--bg3)",
          borderRadius: 4,
          padding: "3px 8px",
          fontSize: 9,
          color: "var(--ink4)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        app.daloy-finance.online/home
      </div>
    </div>
    {/* App body */}
    <div style={{ display: "flex", height: 290 }}>
      {/* Sidebar */}
      <div
        style={{
          width: 44,
          background: "var(--ink)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 0",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Lora', serif",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--forest-xl)",
          }}
        >
          d
        </span>
        {[
          {
            active: true,
            stroke: "white",
            d: (
              <>
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </>
            ),
          },
          {
            active: false,
            stroke: "rgba(255,255,255,0.4)",
            d: (
              <>
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </>
            ),
          },
          {
            active: false,
            stroke: "rgba(255,255,255,0.4)",
            d: (
              <>
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
              </>
            ),
          },
          {
            active: false,
            stroke: "rgba(255,255,255,0.4)",
            d: (
              <>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </>
            ),
          },
        ].map(({ active, stroke, d }, i) => (
          <div
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: active ? "rgba(255,255,255,0.1)" : "transparent",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stroke}
              strokeWidth="2"
            >
              {d}
            </svg>
          </div>
        ))}
        {/* Add txn CTA */}
        <div
          style={{
            marginTop: "auto",
            width: 28,
            height: 28,
            background: "var(--forest)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
      {/* Main */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "10px 10px 0",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <div>
          <div style={{ fontSize: 8, color: "var(--ink4)" }}>
            Good morning,
          </div>
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            Morphy.
          </div>
        </div>
        {/* Stat row */}
        <div style={{ display: "flex", gap: 5 }}>
          {(
            [
              ["Net Balance", "₱42,850", "var(--ink)"],
              ["Income", "₱35,000", "var(--income)"],
              ["Expenses", "₱18,420", "var(--expense)"],
              ["Savings Rate", "47.4%", "var(--forest)"],
            ] as [string, string, string][]
          ).map(([lbl, val, color]) => (
            <div
              key={lbl}
              style={{
                flex: 1,
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 6,
                padding: "5px 7px",
              }}
            >
              <div
                style={{
                  fontSize: 6.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {lbl}
              </div>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11.5,
                  fontWeight: 500,
                  color,
                  marginTop: 1,
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
        {/* Content row */}
        <div
          style={{
            display: "flex",
            gap: 7,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Transactions */}
          <div
            style={{
              flex: 1,
              background: "var(--bg2)",
              border: "1px solid var(--bg3)",
              borderRadius: 7,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "4px 7px",
                borderBottom: "1px solid var(--bg3)",
                fontSize: 7,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ink4)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Recent Transactions
            </div>
            {(
              [
                ["☕", "Starbucks", "−₱220", "var(--expense)"],
                ["💼", "Freelance - Client A", "+₱15,000", "var(--income)"],
                ["🛒", "SM Supermarket", "−₱1,240", "var(--expense)"],
                ["🚌", "Grab Ride", "−₱180", "var(--expense)"],
                ["🔄", "BPI → GCash Transfer", "₱2,000", "var(--steel-m)"],
              ] as [string, string, string, string][]
            ).map(([ic, name, amt, c]) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 7px",
                  borderBottom: "1px solid var(--bg3)",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: "var(--bg3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    flexShrink: 0,
                  }}
                >
                  {ic}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 7.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 7.5,
                    color: c,
                  }}
                >
                  {amt}
                </div>
              </div>
            ))}
          </div>
          {/* Right col */}
          <div
            style={{
              width: 112,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* Wallets */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 7,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "4px 7px",
                  borderBottom: "1px solid var(--bg3)",
                  fontSize: 7,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Wallets
              </div>
              {(
                [
                  ["💵 Cash", "₱5,200", "#5C4033"],
                  ["📱 GCash", "₱12,450", "#005CFF"],
                  ["🏦 BPI", "₱16,500", "#CC0000"],
                ] as [string, string, string][]
              ).map(([name, amt, bg]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "4px 6px",
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: bg,
                  }}
                >
                  <span
                    style={{
                      fontSize: 7,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 7,
                      color: "#fff",
                    }}
                  >
                    {amt}
                  </span>
                </div>
              ))}
            </div>
            {/* Budgets */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 7,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "4px 7px",
                  borderBottom: "1px solid var(--bg3)",
                  fontSize: 7,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink4)",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                Budget Snapshot
              </div>
              {(
                [
                  ["🛒 Groceries", "64%", 64, "var(--forest-l)"],
                  ["🍔 Food", "94%", 94, "#C4913A"],
                  ["🎮 Entertainment", "OVER", 100, "var(--expense)"],
                ] as [string, string, number, string][]
              ).map(([name, pct, w, c]) => (
                <div
                  key={name}
                  style={{
                    padding: "4px 7px",
                    borderBottom: "1px solid var(--bg3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 7,
                        fontWeight: 500,
                        color: "var(--ink2)",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 6.5,
                        color: c,
                      }}
                    >
                      {pct}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 100,
                      background: "var(--bg3)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 100,
                        width: `${w}%`,
                        background: c,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function AppShowcase() {
  const { ref: sectionRef, inView } = useInView(0.1);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      style={{
        width: "100%",
        padding: "72px 24px 80px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle gradient bg blob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, var(--forest-bg) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Header copy ── */}
      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          marginBottom: 40,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--forest-l)",
            display: "block",
            marginBottom: 12,
          }}
        >
          See it in action
        </span>
        <h2
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            color: "var(--ink)",
            lineHeight: 1.15,
            margin: "0 0 14px",
          }}
        >
          Built for every screen.
        </h2>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            fontSize: "0.95rem",
            color: "var(--ink3)",
            lineHeight: 1.7,
            maxWidth: 460,
            margin: "0 auto 24px",
          }}
        >
          Whether you're checking balances on the go or reviewing budgets at
          your desk, Daloy feels right at home.
        </p>
        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {pills.map(({ emoji, label }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "var(--bg2)",
                border: "1px solid var(--bg3)",
                borderRadius: 100,
                padding: "5px 12px",
                fontSize: "0.78rem",
                color: "var(--ink2)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
              }}
            >
              {emoji} {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Device showcase ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 48,
          width: "100%",
          maxWidth: 1020,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── MOBILE column ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--forest-l)",
            }}
          >
            Mobile
          </span>

          <MobileMockup />

          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "0.78rem",
              color: "var(--ink4)",
              textAlign: "center",
              maxWidth: 200,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            All your finances at a glance — wherever you are.
          </p>
        </div>

        {/* ── DESKTOP column ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            flex: 1,
            minWidth: 280,
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--forest-l)",
            }}
          >
            Desktop
          </span>
          <DesktopMockup />
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: "0.78rem",
              color: "var(--ink4)",
              textAlign: "center",
              maxWidth: 340,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            The full picture — stat cards, transaction ledger, wallet summary,
            and budget snapshot on one screen.
          </p>
        </div>
      </div>
    </section>
  );
}