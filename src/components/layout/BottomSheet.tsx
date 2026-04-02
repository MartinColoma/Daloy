import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   BottomSheet.tsx — Mobile bottom sheet base
   Slide-up from bottom with drag handle,
   animated backdrop, closes on outside tap.
───────────────────────────────────────────── */

interface BottomSheetProps {
  isOpen:   boolean;
  onClose:  () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity"
        style={{ background: "rgba(28,26,23,0.45)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[var(--radius-lg)] animate-slide-up"
        style={{
          background: "var(--bg2)",
          boxShadow: "var(--shadow-lg)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--bg3)" }}
          />
        </div>
        {children}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}</style>
    </>
  );
}