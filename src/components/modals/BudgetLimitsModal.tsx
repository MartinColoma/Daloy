import { useState } from "react";
import { SlidersHorizontal, Plus, Check, X } from "lucide-react";
import ModalShell from "./ModalShell";

/* ─────────────────────────────────────────────
   BudgetLimitsModal.tsx
   DB reads/writes to: budgets table
   Fields: category_id, amount_limit, period,
           period_start, period_end, rollover
   Budget spent = queried at runtime from transactions,
   never stored (per schema rule).
───────────────────────────────────────────── */

interface BudgetEnvelope {
  id: string;
  categoryId: string;
  categoryIcon: string;
  categoryName: string;
  limit: number;
  spent: number;
  period: "monthly" | "weekly";
  rollover: boolean;
}

const MOCK_BUDGETS: BudgetEnvelope[] = [
  { id: "b1", categoryId: "1", categoryIcon: "🍽️", categoryName: "Food & Dining",  limit: 5000, spent: 3200, period: "monthly", rollover: false },
  { id: "b2", categoryId: "2", categoryIcon: "🚌", categoryName: "Transport",       limit: 2000, spent: 1820, period: "monthly", rollover: false },
  { id: "b3", categoryId: "4", categoryIcon: "⭐", categoryName: "Entertainment",   limit: 1500, spent: 1650, period: "monthly", rollover: false },
  { id: "b4", categoryId: "5", categoryIcon: "🏠", categoryName: "Utilities",       limit: 3000, spent: 2100, period: "monthly", rollover: true  },
];

const UNBUDGETED_CATEGORIES = [
  { id: "7",  icon: "👕", name: "Shopping" },
  { id: "6",  icon: "💊", name: "Health" },
  { id: "3",  icon: "🛒", name: "Groceries" },
  { id: "8",  icon: "📦", name: "Other" },
];

function budgetColor(spent: number, limit: number): string {
  const pct = spent / limit;
  if (pct >= 1)    return "var(--expense)";
  if (pct >= 0.75) return "#C4913A";
  return "var(--forest-l)";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetLimitsModal({ isOpen, onClose }: Props) {
  const [budgets,   setBudgets]   = useState<BudgetEnvelope[]>(MOCK_BUDGETS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [showAdd,   setShowAdd]   = useState(false);
  const [newCatId,  setNewCatId]  = useState(UNBUDGETED_CATEGORIES[0]?.id ?? "");
  const [newLimit,  setNewLimit]  = useState("");
  const [newPeriod, setNewPeriod] = useState<"monthly" | "weekly">("monthly");

  const startEdit = (b: BudgetEnvelope) => {
    setEditingId(b.id);
    setEditLimit(String(b.limit));
  };

  const saveEdit = (id: string) => {
    // TODO: budgetService.updateBudget(id, { amount_limit: parseFloat(editLimit) })
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, limit: parseFloat(editLimit) || b.limit } : b));
    setEditingId(null);
  };

  const deleteBudget = (id: string) => {
    // TODO: budgetService.deleteBudget(id)
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const toggleRollover = (id: string) => {
    // TODO: budgetService.updateBudget(id, { rollover: !current })
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, rollover: !b.rollover } : b));
  };

  const addBudget = () => {
    const cat = UNBUDGETED_CATEGORIES.find(c => c.id === newCatId);
    if (!cat || !newLimit) return;
    const newEntry: BudgetEnvelope = {
      id: `b${Date.now()}`,
      categoryId: cat.id,
      categoryIcon: cat.icon,
      categoryName: cat.name,
      limit: parseFloat(newLimit),
      spent: 0,
      period: newPeriod,
      rollover: false,
    };
    // TODO: budgetService.createBudget({ category_id, amount_limit, period, period_start, period_end, rollover })
    setBudgets(prev => [...prev, newEntry]);
    setShowAdd(false);
    setNewLimit("");
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Budget Limits"
      subtitle="Manage your monthly spending envelopes"
      icon={<SlidersHorizontal size={18} strokeWidth={1.5} />}
      accentColor="var(--forest)"
      wide
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Month summary */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg2)",
            border: "1.5px solid var(--bg3)",
          }}>
            <p className="daloy-eyebrow" style={{ marginBottom: 4 }}>budgeted / month</p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500, fontSize: "1.0rem", color: "var(--ink)", margin: 0 }}>
              ₱{totalBudgeted.toLocaleString()}
            </p>
          </div>
          <div style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg2)",
            border: "1.5px solid var(--bg3)",
          }}>
            <p className="daloy-eyebrow" style={{ marginBottom: 4 }}>spent so far</p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500, fontSize: "1.0rem", color: "var(--ink)", margin: 0 }}>
              ₱{totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Budget list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {budgets.map(b => {
            const pct   = Math.min((b.spent / b.limit) * 100, 100);
            const color = budgetColor(b.spent, b.limit);
            const isOver = b.spent > b.limit;
            const isEditing = editingId === b.id;

            return (
              <div
                key={b.id}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg2)",
                  border: `1.5px solid ${isEditing ? "var(--forest-m)" : "var(--bg3)"}`,
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "1rem" }}>{b.categoryIcon}</span>
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.86rem", fontWeight: 500, color: "var(--ink2)", flex: 1 }}>
                    {b.categoryName}
                  </span>
                  {/* Limit field */}
                  {isEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.8rem", color: "var(--ink4)" }}>₱</span>
                      <input
                        type="number"
                        value={editLimit}
                        onChange={e => setEditLimit(e.target.value)}
                        autoFocus
                        style={{
                          width: "80px",
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "0.88rem",
                          padding: "4px 8px",
                          border: "1.5px solid var(--forest-m)",
                          borderRadius: "4px",
                          background: "var(--bg)",
                          outline: "none",
                          color: "var(--ink)",
                        }}
                      />
                      <button onClick={() => saveEdit(b.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--forest)", padding: 0, display: "flex" }}>
                        <Check size={15} strokeWidth={2} />
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink4)", padding: 0, display: "flex" }}>
                        <X size={15} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.82rem", color: "var(--ink2)", cursor: "pointer" }}
                        onClick={() => startEdit(b)}
                        title="Click to edit"
                      >
                        ₱{b.limit.toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink4)", padding: 0, display: "flex", opacity: 0.6 }}
                      >
                        <X size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ height: "6px", borderRadius: "100px", background: "var(--bg3)", overflow: "hidden", marginBottom: "6px" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: "100px", background: color, transition: "width 0.4s" }} />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.67rem", color: isOver ? "var(--expense)" : "var(--ink4)", margin: 0 }}>
                    {isOver
                      ? `Over by ₱${(b.spent - b.limit).toLocaleString()}`
                      : `₱${(b.limit - b.spent).toLocaleString()} remaining`}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.65rem", color: "var(--ink4)" }}>Rollover</span>
                    <button
                      onClick={() => toggleRollover(b.id)}
                      style={{
                        width: "30px",
                        height: "17px",
                        borderRadius: "100px",
                        background: b.rollover ? "var(--forest)" : "var(--bg3)",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: "absolute",
                        top: "2px",
                        left: b.rollover ? "14px" : "2px",
                        width: "13px",
                        height: "13px",
                        borderRadius: "100px",
                        background: "white",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add new budget */}
        {showAdd ? (
          <div style={{
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--forest-bg)",
            border: "1.5px solid var(--forest-xl)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--forest)", margin: 0 }}>
              New Envelope
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="daloy-field">
                <label className="daloy-label">Category</label>
                <select className="daloy-select" value={newCatId} onChange={e => setNewCatId(e.target.value)}>
                  {UNBUDGETED_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="daloy-field">
                <label className="daloy-label">Period</label>
                <select className="daloy-select" value={newPeriod} onChange={e => setNewPeriod(e.target.value as "monthly" | "weekly")}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div className="daloy-field">
              <label className="daloy-label">Limit (₱)</label>
              <input
                className="daloy-input"
                type="number"
                placeholder="e.g. 3000"
                value={newLimit}
                onChange={e => setNewLimit(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="daloy-btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: "0 0 auto" }}>
                Cancel
              </button>
              <button
                className="daloy-btn-primary"
                onClick={addBudget}
                disabled={!newLimit}
                style={{ background: !newLimit ? "var(--bg3)" : "var(--forest)", color: !newLimit ? "var(--ink4)" : "white" }}
              >
                Add Envelope
              </button>
            </div>
          </div>
        ) : (
          UNBUDGETED_CATEGORIES.length > 0 && (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px dashed var(--bg3)",
                background: "transparent",
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--ink4)",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--forest-xl)"; e.currentTarget.style.color = "var(--forest)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bg3)"; e.currentTarget.style.color = "var(--ink4)"; }}
            >
              <Plus size={14} strokeWidth={1.5} />
              Add budget envelope
            </button>
          )
        )}

        {/* Done */}
        <button className="daloy-btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </ModalShell>
  );
}