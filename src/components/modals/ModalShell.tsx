import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/* ─────────────────────────────────────────────
   ModalShell.tsx
   Base wrapper used by all 7 Quick Action modals.

   Desktop: centered dialog, max-w-[460px], backdrop blur
   Mobile: bottom sheet, slides up, drag handle
───────────────────────────────────────────── */

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;   // e.g. "var(--expense)" or "var(--income)"
  children: React.ReactNode;
  /** Override max-width for wider modals (e.g. BudgetLimits) */
  wide?: boolean;
}

export default function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = "var(--forest)",
  children,
  wide = false,
}: ModalShellProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(28,26,23,0.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          animation: "daloy-fade-in 0.15s ease",
        }}
      />

      {/* ── Dialog ── */}
      {/* Desktop: centered | Mobile: bottom sheet */}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          // Desktop
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)",
          maxWidth: wide ? "580px" : "460px",
          background: "var(--bg)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "daloy-modal-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        // Mobile override via class
        className="daloy-modal-dialog"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle (visible only on mobile via CSS) */}
        <div className="daloy-drag-handle" style={{
          width: "36px",
          height: "4px",
          borderRadius: "100px",
          background: "var(--bg3)",
          margin: "12px auto 0",
          display: "none", // shown via .daloy-drag-handle media query
        }} />

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--bg3)",
            flexShrink: 0,
          }}
        >
          {icon && (
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-sm)",
              background: `color-mix(in srgb, ${accentColor} 12%, var(--bg))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: accentColor,
            }}>
              {icon}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: "1.0rem",
              color: "var(--ink)",
              margin: 0,
              lineHeight: 1.2,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 400,
                fontSize: "0.72rem",
                color: "var(--ink4)",
                margin: "2px 0 0",
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--bg3)",
              background: "var(--bg2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: "var(--ink3)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{
          padding: "20px",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
        }}>
          {children}
        </div>
      </div>

      {/* ── Keyframes + Mobile overrides ── */}
      <style>{`
        @keyframes daloy-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes daloy-modal-in {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes daloy-sheet-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        /* Mobile: bottom sheet */
        @media (max-width: 767px) {
          .daloy-modal-dialog {
            top: auto !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 18px 18px 0 0 !important;
            max-height: 92vh !important;
            animation: daloy-sheet-in 0.28s cubic-bezier(0.32, 0.72, 0, 1) !important;
          }
          .daloy-drag-handle {
            display: block !important;
          }
        }

        /* Shared field styles */
        .daloy-field { display: flex; flex-direction: column; gap: 6px; }
        .daloy-label {
          font-family: Outfit, sans-serif;
          font-weight: 500;
          font-size: 0.78rem;
          color: var(--ink2);
        }
        .daloy-input {
          font-family: Outfit, sans-serif;
          font-size: 0.88rem;
          color: var(--ink);
          background: var(--bg2);
          border: 1.5px solid var(--bg3);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
        }
        .daloy-input:focus { border-color: var(--forest-m); }
        .daloy-input-mono {
          font-family: "IBM Plex Mono", monospace;
          font-size: 1.4rem;
          font-weight: 500;
          color: var(--ink);
          background: transparent;
          border: none;
          border-bottom: 2px solid var(--bg3);
          border-radius: 0;
          padding: 8px 0;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .daloy-input-mono:focus { border-color: var(--forest-m); }
        .daloy-hint {
          font-family: Outfit, sans-serif;
          font-size: 0.68rem;
          color: var(--ink4);
        }
        .daloy-select {
          font-family: Outfit, sans-serif;
          font-size: 0.88rem;
          color: var(--ink);
          background: var(--bg2);
          border: 1.5px solid var(--bg3);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%239C9890' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .daloy-select:focus { border-color: var(--forest-m); }
        .daloy-btn-primary {
          font-family: Outfit, sans-serif;
          font-weight: 500;
          font-size: 0.88rem;
          color: white;
          background: var(--forest);
          border: none;
          border-radius: var(--radius-sm);
          padding: 11px 20px;
          cursor: pointer;
          width: 100%;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .daloy-btn-primary:hover { background: var(--forest-m); }
        .daloy-btn-ghost {
          font-family: Outfit, sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          color: var(--ink3);
          background: transparent;
          border: 1.5px solid var(--bg3);
          border-radius: var(--radius-sm);
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .daloy-btn-ghost:hover { background: var(--bg2); }
        .daloy-divider {
          height: 1px;
          background: var(--bg3);
          margin: 4px 0;
        }
        .daloy-eyebrow {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.57rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink4);
        }
        .daloy-amount-preview {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.8rem;
          color: var(--ink3);
          padding: 8px 12px;
          background: var(--bg2);
          border-radius: var(--radius-sm);
          border: 1px solid var(--bg3);
        }
      `}</style>
    </>
  );
}