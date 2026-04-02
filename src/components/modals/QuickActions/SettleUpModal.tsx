import { useState } from "react";
import { Handshake, CheckCircle, ChevronLeft } from "lucide-react";
import ModalShell from "../ModalShell";

/* ─────────────────────────────────────────────
   SettleUpModal.tsx  (refactored)

   Reads from: debt_records joined with group_expenses + groups
   DB writes on settlement:
     debt_records  status → 'settled', settled_at = now()
     transactions  type='settlement'
                   · If YOU are the debtor: wallet_id = your payment wallet,
                     amount negative (money out)
                   · If YOU are the creditor: wallet_id = your receive wallet,
                     amount positive (money in)

   Calls POST /settle edge function which handles both
   the debt_record update and transaction creation atomically.

   DebtRecord directions:
     direction="owe"  → current user is the DEBTOR  (owes the creditor)
     direction="owed" → current user is the CREDITOR (is owed by the debtor)

   Settlement flow:
     "owe"  (you pay) → pick your wallet → confirm → money out
     "owed" (they pay) → choose how received: wallet or cash → confirm
───────────────────────────────────────────── */

// ── Types ──────────────────────────────────────────────────────
interface DebtRecord {
  id: string;
  groupName: string;
  groupIcon: string;
  /** The OTHER person in this debt relationship */
  counterparty: string;
  counterpartyInitial: string;
  direction: "owe" | "owed";
  amount: number;
  currency: string;
  /** What the original expense was for */
  expenseDescription: string;
  expenseDate: string;
}

// ── Mock data ─────────────────────────────────────────────────
const MOCK_DEBTS: DebtRecord[] = [
  {
    id: "d1",
    groupName: "Barkada Trip 2025", groupIcon: "✈️",
    counterparty: "Juan",  counterpartyInitial: "J",
    direction: "owed",     // Juan owes YOU
    amount: 1250, currency: "PHP",
    expenseDescription: "Dinner at Kamiseta", expenseDate: "Mar 29",
  },
  {
    id: "d2",
    groupName: "Barkada Trip 2025", groupIcon: "✈️",
    counterparty: "Pedro", counterpartyInitial: "P",
    direction: "owe",      // YOU owe Pedro
    amount: 875, currency: "PHP",
    expenseDescription: "Airfare split", expenseDate: "Mar 27",
  },
  {
    id: "d3",
    groupName: "Housemates", groupIcon: "🏠",
    counterparty: "Rosa",  counterpartyInitial: "R",
    direction: "owed",     // Rosa owes YOU
    amount: 600, currency: "PHP",
    expenseDescription: "Meralco bill", expenseDate: "Mar 25",
  },
  {
    id: "d4",
    groupName: "Housemates", groupIcon: "🏠",
    counterparty: "Carlo", counterpartyInitial: "C",
    direction: "owe",      // YOU owe Carlo
    amount: 450, currency: "PHP",
    expenseDescription: "Internet bill", expenseDate: "Mar 24",
  },
];

const MOCK_WALLETS = [
  { id: "w1", name: "BPI Jumpstart", icon: "🏦" },
  { id: "w2", name: "GCash",         icon: "💙" },
  { id: "w3", name: "Maya",          icon: "💚" },
  { id: "w4", name: "Cash",          icon: "💵" },
];

// ── Helpers ───────────────────────────────────────────────────
function Avatar({ initial, direction, size = 32 }: {
  initial: string; direction: "owe" | "owed"; size?: number;
}) {
  const isOwed = direction === "owed";
  return (
    <div style={{
      width: size, height: size, borderRadius: "100px", flexShrink: 0,
      background: isOwed ? "var(--forest-bg)" : "#FBF0F0",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: `${Math.round(size * 0.38)}px`,
      fontWeight: 700,
      color: isOwed ? "var(--forest)" : "var(--expense)",
    }}>
      {initial}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettleUpModal({ isOpen, onClose }: Props) {

  const [settled,      setSettled]      = useState<string[]>([]);
  const [selected,     setSelected]     = useState<DebtRecord | null>(null);
  const [walletId,     setWalletId]     = useState("w2");
  const [receiveMode,  setReceiveMode]  = useState<"wallet" | "cash">("wallet");
  const [confirming,   setConfirming]   = useState(false);

  const pending  = MOCK_DEBTS.filter(d => !settled.includes(d.id));
  const owedToMe = pending.filter(d => d.direction === "owed");
  const iOwe     = pending.filter(d => d.direction === "owe");
  const totalIn  = owedToMe.reduce((s, d) => s + d.amount, 0);
  const totalOut = iOwe.reduce((s, d)     => s + d.amount, 0);

  const selectDebt = (d: DebtRecord) => {
    setSelected(d);
    setConfirming(true);
  };

  const confirmSettle = () => {
    if (!selected) return;
    // TODO: groupService.settleDebt(selected.id, {
    //   wallet_id:    selected.direction === "owe" ? walletId
    //                 : receiveMode === "wallet"   ? walletId : undefined,
    //   receive_mode: selected.direction === "owed" ? receiveMode : undefined,
    // })
    // Edge function POST /settle:
    //   1. debt_records.status = 'settled', settled_at = now()
    //   2. INSERT transactions:
    //      - debtor  → type='settlement', amount=-debt.amount (money out)
    //      - creditor → type='settlement', amount=+debt.amount (money in)
    setSettled(prev => [...prev, selected.id]);
    setSelected(null);
    setConfirming(false);
  };

  const cancelConfirm = () => {
    setSelected(null);
    setConfirming(false);
  };

  const handleClose = () => {
    cancelConfirm();
    onClose();
  };

  // ── Confirm sub-view ──
  if (confirming && selected) {
    const isOwe   = selected.direction === "owe";
    const wallet  = MOCK_WALLETS.find(w => w.id === walletId)!;

    return (
      <ModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title="Settle Up"
        subtitle="Confirm this settlement"
        icon={<Handshake size={18} strokeWidth={1.5} />}
        accentColor="var(--forest)"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>

          {/* Settlement summary */}
          <div style={{
            padding: "20px 16px", borderRadius: "var(--radius-md)",
            background: isOwe ? "#FBF0F0" : "var(--forest-bg)",
            border: `1px solid ${isOwe ? "#E8B5B5" : "var(--forest-xl)"}`,
            textAlign: "center",
          }}>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.75rem", color: "var(--ink4)", margin: "0 0 6px" }}>
              {isOwe
                ? `You're paying ${selected.counterparty}`
                : `Marking ${selected.counterparty}'s payment as received`}
            </p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "2rem", fontWeight: 500, margin: 0, color: isOwe ? "var(--expense)" : "var(--income)" }}>
              {isOwe ? "−" : "+"}₱{selected.amount.toLocaleString()}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.7rem", color: "var(--ink4)", marginTop: 6 }}>
              {selected.groupIcon} {selected.groupName} · {selected.expenseDescription}
            </p>
          </div>

          {/* Debtor pays — pick wallet */}
          {isOwe && (
            <div className="daloy-field">
              <label className="daloy-label">Pay from wallet</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {MOCK_WALLETS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setWalletId(w.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "var(--radius-sm)", textAlign: "left",
                      border: `1.5px solid ${walletId === w.id ? "var(--forest-m)" : "var(--bg3)"}`,
                      background: walletId === w.id ? "var(--forest-bg)" : "var(--bg2)",
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{w.icon}</span>
                    <span style={{
                      fontFamily: "Outfit, sans-serif", fontSize: "0.85rem", fontWeight: walletId === w.id ? 600 : 400,
                      color: walletId === w.id ? "var(--forest)" : "var(--ink2)", flex: 1,
                    }}>
                      {w.name}
                    </span>
                    {walletId === w.id && (
                      <CheckCircle size={15} strokeWidth={1.5} style={{ color: "var(--forest)", flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Creditor receives — wallet or cash */}
          {!isOwe && (
            <div className="daloy-field">
              <label className="daloy-label">
                How did you receive this?
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["wallet", "cash"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setReceiveMode(mode)}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${receiveMode === mode ? "var(--forest-m)" : "var(--bg3)"}`,
                      background: receiveMode === mode ? "var(--forest-bg)" : "var(--bg2)",
                      color: receiveMode === mode ? "var(--forest)" : "var(--ink3)",
                      fontFamily: "Outfit, sans-serif", fontSize: "0.82rem", fontWeight: 500,
                      cursor: "pointer", transition: "all 0.12s", textTransform: "capitalize",
                    }}
                  >
                    {mode === "wallet" ? "🏦 Into wallet" : "💵 Cash"}
                  </button>
                ))}
              </div>
              {receiveMode === "wallet" && (
                <select className="daloy-select" value={walletId} onChange={e => setWalletId(e.target.value)} style={{ marginTop: 8 }}>
                  {MOCK_WALLETS.filter(w => w.id !== "w4").map(w => (
                    <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Confirmation note */}
          <div style={{
            padding: "10px 12px", borderRadius: "var(--radius-sm)",
            background: "var(--bg2)", border: "1px solid var(--bg3)",
          }}>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.75rem", color: "var(--ink3)", margin: 0 }}>
              {isOwe
                ? `A settlement transaction of −₱${selected.amount.toLocaleString()} will be recorded from ${wallet?.icon} ${wallet?.name}.`
                : `The debt will be marked settled and a +₱${selected.amount.toLocaleString()} income transaction will be recorded.`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="daloy-btn-ghost" onClick={cancelConfirm} style={{ flexShrink: 0 }}>
              <ChevronLeft size={13} strokeWidth={1.5} style={{ display: "inline", marginRight: 2 }} />
              Back
            </button>
            <button
              className="daloy-btn-primary"
              onClick={confirmSettle}
              style={{ background: "var(--forest)", color: "white" }}
            >
              <CheckCircle size={15} strokeWidth={1.5} />
              Confirm Settlement
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  // ── Main list view ──
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Settle Up"
      subtitle="Resolve outstanding debts across all groups"
      icon={<Handshake size={18} strokeWidth={1.5} />}
      accentColor="var(--forest)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "4px" }}>

        {/* Net summary */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{
            flex: 1, padding: "10px 12px", borderRadius: "var(--radius-sm)",
            background: "var(--forest-bg)", border: "1px solid var(--forest-xl)",
          }}>
            <p className="daloy-eyebrow" style={{ color: "var(--forest)", marginBottom: 4 }}>
              owed to you
            </p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500, fontSize: "1rem", color: "var(--income)", margin: 0 }}>
              +₱{totalIn.toLocaleString()}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.65rem", color: "var(--ink4)", marginTop: 2 }}>
              from {owedToMe.length} {owedToMe.length === 1 ? "person" : "people"}
            </p>
          </div>
          <div style={{
            flex: 1, padding: "10px 12px", borderRadius: "var(--radius-sm)",
            background: "#FBF0F0", border: "1px solid #E8B5B5",
          }}>
            <p className="daloy-eyebrow" style={{ color: "var(--expense)", marginBottom: 4 }}>
              you owe
            </p>
            <p style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 500, fontSize: "1rem", color: "var(--expense)", margin: 0 }}>
              −₱{totalOut.toLocaleString()}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.65rem", color: "var(--ink4)", marginTop: 2 }}>
              to {iOwe.length} {iOwe.length === 1 ? "person" : "people"}
            </p>
          </div>
        </div>

        {/* They owe you */}
        {owedToMe.length > 0 && (
          <section>
            <p className="daloy-eyebrow" style={{ marginBottom: 8 }}>They owe you</p>
            <div style={{ borderRadius: "var(--radius-sm)", border: "1.5px solid var(--bg3)", overflow: "hidden" }}>
              {owedToMe.map((d, i) => (
                <DebtRow
                  key={d.id}
                  debt={d}
                  last={i === owedToMe.length - 1}
                  onSettle={() => selectDebt(d)}
                />
              ))}
            </div>
          </section>
        )}

        {/* You owe them */}
        {iOwe.length > 0 && (
          <section>
            <p className="daloy-eyebrow" style={{ marginBottom: 8 }}>You owe them</p>
            <div style={{ borderRadius: "var(--radius-sm)", border: "1.5px solid var(--bg3)", overflow: "hidden" }}>
              {iOwe.map((d, i) => (
                <DebtRow
                  key={d.id}
                  debt={d}
                  last={i === iOwe.length - 1}
                  onSettle={() => selectDebt(d)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All settled */}
        {pending.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <p style={{ fontSize: "2.2rem", margin: "0 0 8px" }}>🎉</p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--ink2)", margin: 0 }}>
              All settled!
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", color: "var(--ink4)", marginTop: 4 }}>
              You're all square across all your groups.
            </p>
          </div>
        )}

        <button className="daloy-btn-ghost" onClick={handleClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}

// ── DebtRow sub-component ─────────────────────────────────────
function DebtRow({ debt, last, onSettle }: {
  debt: DebtRecord; last: boolean; onSettle: () => void;
}) {
  const isOwed = debt.direction === "owed";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 12px",
      borderBottom: last ? "none" : "1px solid var(--bg3)",
    }}>
      <Avatar initial={debt.counterpartyInitial} direction={debt.direction} size={34} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "Outfit, sans-serif", fontSize: "0.84rem", fontWeight: 500,
          color: "var(--ink)", margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {debt.counterparty}
        </p>
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.66rem", color: "var(--ink4)", margin: "1px 0 0" }}>
          {debt.groupIcon} {debt.groupName} · {debt.expenseDescription}
        </p>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
        <p style={{
          fontFamily: "IBM Plex Mono, monospace", fontSize: "0.88rem", fontWeight: 500,
          color: isOwed ? "var(--income)" : "var(--expense)", margin: 0,
        }}>
          {isOwed ? "+" : "−"}₱{debt.amount.toLocaleString()}
        </p>
        <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.62rem", color: "var(--ink4)", margin: "1px 0 0" }}>
          {debt.expenseDate}
        </p>
      </div>

      <button
        onClick={onSettle}
        style={{
          padding: "5px 11px", borderRadius: "var(--radius-sm)", flexShrink: 0,
          border: `1.5px solid ${isOwed ? "var(--forest-xl)" : "#E8B5B5"}`,
          background: isOwed ? "var(--forest-bg)" : "#FBF0F0",
          fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", fontWeight: 500,
          color: isOwed ? "var(--forest)" : "var(--expense)",
          cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = isOwed ? "var(--forest-xl)" : "#E8B5B5";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isOwed ? "var(--forest-bg)" : "#FBF0F0";
          e.currentTarget.style.color = isOwed ? "var(--forest)" : "var(--expense)";
        }}
      >
        {isOwed ? "Received" : "Pay"}
      </button>
    </div>
  );
}