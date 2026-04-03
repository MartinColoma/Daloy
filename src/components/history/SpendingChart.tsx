import { useState } from "react";
import type { BarDatum } from "../../lib/historyUtils";
import { fmt } from "../../lib/historyUtils";

// ── Tooltip ────────────────────────────────────────────────────────────────
interface TooltipData {
  x: number;
  label: string;
  income: number;
  expense: number;
}

function BarTooltip({ data }: { data: TooltipData }) {
  const net = data.income - data.expense;
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${data.x}px`,
        top: "-8px",
        transform: "translateX(-50%) translateY(-100%)",
        minWidth: "110px",
      }}
    >
      <div
        className="rounded-[var(--radius-md)] px-2.5 py-2 flex flex-col gap-1 shadow-lg"
        style={{
          background: "var(--ink)",
          border: "1px solid var(--ink2)",
        }}
      >
        <p
          className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-center"
          style={{ color: "var(--ink4)" }}
        >
          {data.label}
        </p>
        {data.income > 0 && (
          <div className="flex items-center justify-between gap-3">
            <span className="font-outfit text-[0.62rem]" style={{ color: "var(--income)" }}>
              In
            </span>
            <span className="font-mono text-[0.68rem]" style={{ color: "var(--income)" }}>
              +{fmt(data.income)}
            </span>
          </div>
        )}
        {data.expense > 0 && (
          <div className="flex items-center justify-between gap-3">
            <span className="font-outfit text-[0.62rem]" style={{ color: "var(--expense)" }}>
              Out
            </span>
            <span className="font-mono text-[0.68rem]" style={{ color: "var(--expense)" }}>
              −{fmt(data.expense)}
            </span>
          </div>
        )}
        {(data.income > 0 || data.expense > 0) && (
          <>
            <div style={{ height: "1px", background: "var(--ink2)", margin: "1px 0" }} />
            <div className="flex items-center justify-between gap-3">
              <span className="font-outfit text-[0.62rem]" style={{ color: "var(--ink4)" }}>
                Net
              </span>
              <span
                className="font-mono text-[0.68rem] font-medium"
                style={{ color: net >= 0 ? "var(--income)" : "var(--expense)" }}
              >
                {net >= 0 ? "+" : "−"}
                {fmt(net)}
              </span>
            </div>
          </>
        )}
        {data.income === 0 && data.expense === 0 && (
          <p className="font-outfit text-[0.65rem] text-center" style={{ color: "var(--ink4)" }}>
            No transactions
          </p>
        )}
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid var(--ink)",
          }}
        />
      </div>
    </div>
  );
}

// ── SpendingChart ──────────────────────────────────────────────────────────
interface SpendingChartProps {
  bars: BarDatum[];
  loading: boolean;
  /** Called when user clicks a bar, passing the bar index */
  onBarClick?: (index: number) => void;
}

export function SpendingChart({ bars, loading, onBarClick }: SpendingChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);

  if (loading) {
    return (
      <div className="flex items-end justify-between gap-1 h-[80px] px-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-sm"
            style={{
              height: `${30 + Math.random() * 40}%`,
              background: "var(--bg3)",
            }}
          />
        ))}
      </div>
    );
  }

  const maxVal = Math.max(...bars.map((b) => Math.max(b.expense, b.income)), 1);

  return (
    <div className="relative flex items-end justify-between gap-[3px] h-[80px]">
      {bars.map((b, i) => {
        const expH = (b.expense / maxVal) * 100;
        const incH = (b.income / maxVal) * 100;
        const isHovered = hovered === i;
        const isActive = b.active;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-[2px] cursor-pointer group"
            onMouseEnter={(e) => {
              setHovered(i);
              const rect = e.currentTarget.getBoundingClientRect();
              const parent = e.currentTarget.parentElement!.getBoundingClientRect();
              setTooltipX(rect.left - parent.left + rect.width / 2);
            }}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onBarClick?.(i)}
          >
            <div
              className="w-full flex items-end justify-center gap-[2px]"
              style={{ height: "68px" }}
            >
              {b.income > 0 && (
                <div
                  className="flex-1 rounded-t-[2px] transition-all duration-150"
                  style={{
                    height: `${incH}%`,
                    background:
                      isActive || isHovered
                        ? "var(--income)"
                        : "var(--forest-bg)",
                    border:
                      isActive || isHovered
                        ? "none"
                        : "1px solid var(--forest-xl)",
                    opacity: isHovered ? 0.9 : 1,
                  }}
                />
              )}
              {b.expense > 0 && (
                <div
                  className="flex-1 rounded-t-[2px] transition-all duration-150"
                  style={{
                    height: `${expH}%`,
                    background:
                      isActive || isHovered ? "var(--expense)" : "var(--bg3)",
                    opacity: isHovered ? 0.9 : 1,
                  }}
                />
              )}
              {b.income === 0 && b.expense === 0 && (
                <div
                  className="w-full rounded-t-[2px] transition-all duration-150"
                  style={{
                    height: isHovered ? "6px" : "3px",
                    background: "var(--bg3)",
                  }}
                />
              )}
            </div>
            {b.label && (
              <p
                className="font-mono text-[0.48rem] tracking-tight truncate w-full text-center transition-colors"
                style={{
                  color:
                    isActive || isHovered ? "var(--ink)" : "var(--ink4)",
                  fontWeight: isActive || isHovered ? 600 : 400,
                }}
              >
                {b.label}
              </p>
            )}
          </div>
        );
      })}

      {/* Tooltip rendered once, positioned absolutely */}
      {hovered !== null && (
        <BarTooltip
          data={{
            x: tooltipX,
            label: bars[hovered].label || `Bar ${hovered + 1}`,
            income: bars[hovered].income,
            expense: bars[hovered].expense,
          }}
        />
      )}
    </div>
  );
}