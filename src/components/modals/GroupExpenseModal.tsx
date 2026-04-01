import { useState, useRef } from "react";
import { Users, Plus, X, UserCheck, ChevronRight, ChevronLeft } from "lucide-react";
import ModalShell from "./ModalShell";

/* ─────────────────────────────────────────────
   GroupExpenseModal.tsx  (refactored)

   Multi-step flow:
     Step 0 — Details   (amount, description, group, category, date)
     Step 1 — Members   (who's splitting + who paid = creditor)
     Step 2 — Split     (equal / exact / percent per member)
     Step 3 — Review    (summary → confirm)

   DB writes:
     transactions   type='split_expense', wallet_id = creditor's wallet
                    (only written when creditor === current user)
     group_expenses group_id, paid_by (creditor.id), total_amount,
                    split_method, description, category_id, transacted_at
     debt_records   one row per non-creditor member:
                    debtor_id, creditor_id, amount, status='pending'

   Key rule:  Creditor = whoever physically paid.
              Can be ANY group member, not just "you".
              If creditor !== you, no transaction is written for you;
              instead a debt_record is created with you as debtor.
───────────────────────────────────────────── */

// ── Types ──────────────────────────────────────────────────────
interface Member {
  id: string;
  name: string;
  isYou?: boolean;
}

type SplitMethod = "equal" | "exact" | "percent";

// ── Mock data ─────────────────────────────────────────────────
const MOCK_GROUPS = [
  {
    id: "1",
    name: "Barkada Trip 2025",
    icon: "✈️",
    members: [
      { id: "u1", name: "You (Juan)", isYou: true },
      { id: "u2", name: "Maria" },
      { id: "u3", name: "Pedro" },
      { id: "u4", name: "Ana" },
    ] as Member[],
  },
  {
    id: "2",
    name: "Housemates",
    icon: "🏠",
    members: [
      { id: "u1", name: "You (Juan)", isYou: true },
      { id: "u5", name: "Rosa" },
      { id: "u6", name: "Carlo" },
    ] as Member[],
  },
];

const MOCK_CATEGORIES = [
  { id: "1", icon: "🍽️", name: "Food & Dining" },
  { id: "4", icon: "⭐", name: "Entertainment" },
  { id: "2", icon: "🚌", name: "Transport" },
  { id: "5", icon: "🏠", name: "Accommodation" },
  { id: "8", icon: "📦", name: "Other" },
];

const MOCK_WALLETS = [
  { id: "w1", name: "BPI Jumpstart", icon: "🏦" },
  { id: "w2", name: "GCash",         icon: "💙" },
  { id: "w4", name: "Cash",          icon: "💵" },
];

// ── Small reusable bits ────────────────────────────────────────
function MemberAvatar({ member, size = 28, active = false }: {
  member: Member; size?: number; active?: boolean;
}) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "100px",
      background: active ? "var(--clay-bg)" : "var(--bg3)",
      border: `1.5px solid ${active ? "var(--clay-m)" : "transparent"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: `${Math.round(size * 0.38)}px`,
      fontWeight: 600,
      color: active ? "var(--clay)" : "var(--ink3)",
      flexShrink: 0,
    }}>
      {member.name.charAt(0).toUpperCase()}
    </div>
  );
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "4px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === step ? "18px" : "6px",
          height: "6px",
          borderRadius: "100px",
          background: i === step ? "var(--clay-m)" : i < step ? "var(--clay-bg)" : "var(--bg3)",
          border: i < step ? "1.5px solid var(--clay-m)" : "none",
          transition: "all 0.2s",
        }} />
      ))}
    </div>
  );
}

function NavRow({
  onBack, backLabel = "Back",
  onNext, nextLabel = "Next", nextDisabled = false,
}: {
  onBack: () => void; backLabel?: string;
  onNext: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
      <button className="daloy-btn-ghost" onClick={onBack} style={{ flexShrink: 0 }}>
        {backLabel}
      </button>
      <button
        className="daloy-btn-primary"
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          background: nextDisabled ? "var(--bg3)" : "var(--clay)",
          color: nextDisabled ? "var(--ink4)" : "white",
        }}
      >
        {nextLabel}
        {nextLabel !== "Cancel" && (
          <ChevronRight size={13} strokeWidth={2} style={{ marginLeft: 2 }} />
        )}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupExpenseModal({ isOpen, onClose }: Props) {

  // Step 0 — Details
  const [step,        setStep]       = useState(0);
  const [amount,      setAmount]     = useState("");
  const [description, setDesc]       = useState("");
  const [categoryId,  setCategoryId] = useState("1");
  const [groupId,     setGroupId]    = useState("1");
  const [date,        setDate]       = useState(new Date().toISOString().split("T")[0]);

  // Step 1 — Members + creditor
  const baseGroup = MOCK_GROUPS.find(g => g.id === groupId)!;
  const [participants,    setParticipants]    = useState<Member[]>(baseGroup.members);
  const [creditorId,      setCreditorId]      = useState<string>(
    baseGroup.members.find(m => m.isYou)?.id ?? baseGroup.members[0].id
  );
  const [creditorWallet,  setCreditorWallet]  = useState("w1");
  const [newMemberName,   setNewMemberName]   = useState("");
  const [showAddMember,   setShowAddMember]   = useState(false);
  const addMemberRef = useRef<HTMLInputElement>(null);

  const handleGroupChange = (id: string) => {
    const g = MOCK_GROUPS.find(g => g.id === id)!;
    setGroupId(id);
    setParticipants(g.members);
    setCreditorId(g.members.find(m => m.isYou)?.id ?? g.members[0].id);
  };

  const toggleParticipant = (member: Member) => {
    if (member.id === creditorId) return; // creditor always stays in
    setParticipants(prev =>
      prev.find(p => p.id === member.id)
        ? prev.filter(p => p.id !== member.id)
        : [...prev, member]
    );
  };

  const addGuest = () => {
    if (!newMemberName.trim()) return;
    const guest: Member = { id: `guest-${Date.now()}`, name: newMemberName.trim() };
    setParticipants(prev => [...prev, guest]);
    setNewMemberName("");
    setShowAddMember(false);
  };

  const removeGuest = (id: string) => {
    if (id === creditorId) return;
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // Step 2 — Split
  const [splitMethod,    setSplitMethod]    = useState<SplitMethod>("equal");
  const [exactAmounts,   setExactAmounts]   = useState<Record<string, string>>({});
  const [percentAmounts, setPercentAmounts] = useState<Record<string, string>>({});

  const total      = parseFloat(amount) || 0;
  const equalShare = participants.length > 0 ? total / participants.length : 0;
  const exactSum   = Object.values(exactAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const pctSum     = Object.values(percentAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const exactOk    = Math.abs(exactSum - total) < 0.01;
  const pctOk      = Math.abs(pctSum - 100) < 0.01;
  const splitValid = splitMethod === "equal" ? true : splitMethod === "exact" ? exactOk : pctOk;

  const creditor = participants.find(p => p.id === creditorId);
  const debtors  = participants.filter(p => p.id !== creditorId);

  const shareFor = (id: string) =>
    splitMethod === "equal"   ? equalShare :
    splitMethod === "exact"   ? (parseFloat(exactAmounts[id]) || 0) :
    total * (parseFloat(percentAmounts[id]) || 0) / 100;

  // Nav guards
  const step0ok = !!amount && !!description;
  const step1ok = participants.length >= 2 && !!creditorId;

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const reset = () => {
    setStep(0); setAmount(""); setDesc(""); setCategoryId("1");
    handleGroupChange("1"); setDate(new Date().toISOString().split("T")[0]);
    setExactAmounts({}); setPercentAmounts({}); setSplitMethod("equal");
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    // TODO:
    // if (creditor?.isYou) {
    //   transactionService.createTransaction({
    //     type: "split_expense", wallet_id: creditorWallet,
    //     amount: total, original_amount: total, original_currency: "PHP",
    //     exchange_rate: 1, description, transacted_at: date
    //   });
    // }
    // groupService.createGroupExpense({
    //   group_id: groupId, paid_by: creditorId,
    //   total_amount: total, split_method: splitMethod,
    //   description, category_id: categoryId, transacted_at: date
    // });
    // debtors.forEach(debtor => {
    //   groupService.createDebtRecord({
    //     debtor_id: debtor.id, creditor_id: creditorId,
    //     amount: shareFor(debtor.id), status: "pending"
    //   });
    // });
    handleClose();
  };

  const currentGroup    = MOCK_GROUPS.find(g => g.id === groupId)!;
  const currentCategory = MOCK_CATEGORIES.find(c => c.id === categoryId)!;
  const currentWallet   = MOCK_WALLETS.find(w => w.id === creditorWallet)!;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Group Expense"
      subtitle="Split a shared cost with others"
      icon={<Users size={18} strokeWidth={1.5} />}
      accentColor="var(--clay-m)"
      wide
    >
      <div style={{ marginTop: "12px" }}>
        <StepDots step={step} total={4} />
      </div>

      {/* ════ STEP 0 — Details ════ */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>

          <div className="daloy-field">
            <label className="daloy-eyebrow">Total Amount</label>
            <input
              className="daloy-input-mono"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="daloy-field">
            <label className="daloy-label">What was it for?</label>
            <input
              className="daloy-input"
              type="text"
              placeholder="e.g. Dinner at Kamiseta"
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="daloy-field">
              <label className="daloy-label">Group</label>
              <select className="daloy-select" value={groupId} onChange={e => handleGroupChange(e.target.value)}>
                {MOCK_GROUPS.map(g => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>
            <div className="daloy-field">
              <label className="daloy-label">Category</label>
              <select className="daloy-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                {MOCK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="daloy-field">
            <label className="daloy-label">Date</label>
            <input className="daloy-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <NavRow onBack={handleClose} backLabel="Cancel" onNext={next} nextLabel="Members" nextDisabled={!step0ok} />
        </div>
      )}

      {/* ════ STEP 1 — Members + Creditor ════ */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "16px" }}>

          {/* Who paid? */}
          <div className="daloy-field">
            <label className="daloy-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserCheck size={13} strokeWidth={1.5} style={{ color: "var(--clay-m)" }} />
              Who paid?
              <span style={{ fontWeight: 400, color: "var(--ink4)" }}>(this person is the creditor)</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {participants.map(member => {
                const isSelected = member.id === creditorId;
                return (
                  <button
                    key={member.id}
                    onClick={() => setCreditorId(member.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${isSelected ? "var(--clay-m)" : "var(--bg3)"}`,
                      background: isSelected ? "var(--clay-bg)" : "var(--bg2)",
                      cursor: "pointer", transition: "all 0.12s", textAlign: "left",
                    }}
                  >
                    <MemberAvatar member={member} size={28} active={isSelected} />
                    <span style={{
                      fontFamily: "Outfit, sans-serif", fontSize: "0.86rem",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "var(--clay)" : "var(--ink2)", flex: 1,
                    }}>
                      {member.name}
                    </span>
                    {isSelected && (
                      <span style={{
                        fontFamily: "Outfit, sans-serif", fontSize: "0.62rem", fontWeight: 700,
                        padding: "2px 8px", borderRadius: "100px",
                        background: "var(--clay-m)", color: "white", letterSpacing: "0.05em",
                      }}>
                        PAID
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet selector — only when "you" are the creditor */}
          {creditor?.isYou && (
            <div className="daloy-field">
              <label className="daloy-label">Paid from wallet</label>
              <select className="daloy-select" value={creditorWallet} onChange={e => setCreditorWallet(e.target.value)}>
                {MOCK_WALLETS.map(w => (
                  <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Who's splitting? */}
          <div className="daloy-field">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <label className="daloy-label">
                Who's included?
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.62rem", color: "var(--ink4)", marginLeft: 6 }}>
                  {participants.length} selected
                </span>
              </label>
              <button
                onClick={() => { setShowAddMember(true); setTimeout(() => addMemberRef.current?.focus(), 80); }}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontFamily: "Outfit, sans-serif", fontSize: "0.73rem", fontWeight: 500,
                  color: "var(--clay-m)", background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                <Plus size={12} strokeWidth={2} />
                Add guest
              </button>
            </div>

            {/* Group member chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {currentGroup.members.map(member => {
                const isIn       = !!participants.find(p => p.id === member.id);
                const isCreditor = member.id === creditorId;
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleParticipant(member)}
                    disabled={isCreditor}
                    title={isCreditor ? "The person who paid must be included" : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 10px 5px 5px", borderRadius: "100px",
                      border: `1.5px solid ${isIn ? "var(--clay-m)" : "var(--bg3)"}`,
                      background: isIn ? "var(--clay-bg)" : "var(--bg2)",
                      cursor: isCreditor ? "default" : "pointer", transition: "all 0.12s",
                    }}
                  >
                    <MemberAvatar member={member} size={20} active={isIn} />
                    <span style={{
                      fontFamily: "Outfit, sans-serif", fontSize: "0.76rem", fontWeight: 500,
                      color: isIn ? "var(--clay)" : "var(--ink4)",
                    }}>
                      {member.name.split(" ")[0]}
                    </span>
                    {isCreditor && (
                      <span style={{ fontSize: "0.6rem", color: "var(--clay-m)", marginLeft: "-2px" }}>★</span>
                    )}
                  </button>
                );
              })}

              {/* Guest chips */}
              {participants.filter(p => p.id.startsWith("guest-")).map(guest => (
                <div
                  key={guest.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "5px 8px 5px 5px", borderRadius: "100px",
                    border: "1.5px solid var(--clay-m)", background: "var(--clay-bg)",
                  }}
                >
                  <MemberAvatar member={guest} size={20} active />
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.76rem", fontWeight: 500, color: "var(--clay)" }}>
                    {guest.name}
                  </span>
                  <button
                    onClick={() => removeGuest(guest.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--clay-m)", display: "flex", marginLeft: 1 }}
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add guest input */}
            {showAddMember && (
              <div style={{ display: "flex", gap: "7px", marginTop: "9px" }}>
                <input
                  ref={addMemberRef}
                  className="daloy-input"
                  placeholder="e.g. Kuya Gio"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addGuest(); if (e.key === "Escape") setShowAddMember(false); }}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={addGuest}
                  disabled={!newMemberName.trim()}
                  style={{
                    padding: "0 14px", borderRadius: "var(--radius-sm)",
                    background: newMemberName.trim() ? "var(--clay)" : "var(--bg3)",
                    color: newMemberName.trim() ? "white" : "var(--ink4)",
                    border: "none", cursor: "pointer",
                    fontFamily: "Outfit, sans-serif", fontSize: "0.82rem", fontWeight: 500, flexShrink: 0,
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddMember(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink4)", display: "flex", alignItems: "center" }}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
            )}

            {participants.length < 2 && (
              <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", color: "var(--expense)", marginTop: 6 }}>
                At least 2 people are needed to split an expense.
              </p>
            )}
          </div>

          <NavRow onBack={back} onNext={next} nextLabel="Split" nextDisabled={!step1ok} />
        </div>
      )}

      {/* ════ STEP 2 — Split ════ */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>

          {/* Method pills */}
          <div className="daloy-field">
            <label className="daloy-label">How to split ₱{total.toLocaleString()}</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["equal", "exact", "percent"] as SplitMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setSplitMethod(m)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${splitMethod === m ? "var(--clay-m)" : "var(--bg3)"}`,
                    background: splitMethod === m ? "var(--clay-bg)" : "var(--bg2)",
                    color: splitMethod === m ? "var(--clay)" : "var(--ink3)",
                    fontFamily: "Outfit, sans-serif", fontSize: "0.78rem", fontWeight: 500,
                    cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Split table */}
          <div style={{ borderRadius: "var(--radius-sm)", border: "1.5px solid var(--bg3)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              padding: "7px 12px", background: "var(--bg3)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <p className="daloy-eyebrow">{participants.length} members</p>
              {splitMethod === "exact" && (
                <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.68rem", margin: 0, color: exactOk ? "var(--income)" : "var(--expense)" }}>
                  {exactOk ? "✓ Balanced" : `${exactSum > total ? "Over" : "Under"} ₱${Math.abs(exactSum - total).toFixed(2)}`}
                </p>
              )}
              {splitMethod === "percent" && (
                <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.68rem", margin: 0, color: pctOk ? "var(--income)" : "var(--expense)" }}>
                  {pctOk ? "✓ 100%" : `${pctSum.toFixed(1)}% of 100%`}
                </p>
              )}
            </div>

            {participants.map((member, i) => {
              const isCreditor = member.id === creditorId;
              return (
                <div
                  key={member.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px",
                    borderTop: i > 0 ? "1px solid var(--bg3)" : "none",
                    background: isCreditor ? "color-mix(in srgb, var(--clay-bg) 50%, transparent)" : "transparent",
                  }}
                >
                  <MemberAvatar member={member} size={26} active={isCreditor} />
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.82rem", color: "var(--ink2)", flex: 1 }}>
                    {member.name.split(" ")[0]}
                    {isCreditor && (
                      <span style={{ fontSize: "0.63rem", color: "var(--clay-m)", marginLeft: 5 }}>paid</span>
                    )}
                  </span>

                  {splitMethod === "equal" && (
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.84rem", color: "var(--ink)", fontWeight: 500 }}>
                      ₱{equalShare.toFixed(2)}
                    </span>
                  )}
                  {splitMethod === "exact" && (
                    <input
                      type="number"
                      placeholder="0.00"
                      value={exactAmounts[member.id] ?? ""}
                      onChange={e => setExactAmounts(p => ({ ...p, [member.id]: e.target.value }))}
                      style={{
                        fontFamily: "IBM Plex Mono, monospace", fontSize: "0.84rem",
                        width: "90px", textAlign: "right",
                        border: "1.5px solid var(--bg3)", borderRadius: "4px",
                        padding: "4px 8px", background: "var(--bg)", outline: "none", color: "var(--ink)",
                      }}
                    />
                  )}
                  {splitMethod === "percent" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input
                        type="number"
                        placeholder="0"
                        value={percentAmounts[member.id] ?? ""}
                        onChange={e => setPercentAmounts(p => ({ ...p, [member.id]: e.target.value }))}
                        style={{
                          fontFamily: "IBM Plex Mono, monospace", fontSize: "0.84rem",
                          width: "58px", textAlign: "right",
                          border: "1.5px solid var(--bg3)", borderRadius: "4px",
                          padding: "4px 8px", background: "var(--bg)", outline: "none", color: "var(--ink)",
                        }}
                      />
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.78rem", color: "var(--ink4)" }}>%</span>
                      {percentAmounts[member.id] && (
                        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.68rem", color: "var(--ink4)" }}>
                          ≈₱{(total * (parseFloat(percentAmounts[member.id]) || 0) / 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <NavRow onBack={back} onNext={next} nextLabel="Review" nextDisabled={!splitValid} />
        </div>
      )}

      {/* ════ STEP 3 — Review ════ */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>

          {/* Summary card */}
          <div style={{
            borderRadius: "var(--radius-md)", background: "var(--bg2)",
            border: "1.5px solid var(--bg3)", overflow: "hidden",
          }}>
            {/* Top: description + amount */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.7rem", color: "var(--ink4)", margin: 0 }}>
                  {currentCategory.icon} {currentCategory.name} · {currentGroup.icon} {currentGroup.name} · {date}
                </p>
                <p style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", margin: "3px 0 0" }}>
                  {description}
                </p>
              </div>
              <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "1.25rem", fontWeight: 500, color: "var(--ink)", margin: 0, flexShrink: 0 }}>
                ₱{total.toLocaleString()}
              </p>
            </div>

            <div style={{ height: "1px", background: "var(--bg3)" }} />

            {/* Creditor */}
            <div style={{ padding: "10px 16px", background: "color-mix(in srgb, var(--clay-bg) 50%, transparent)" }}>
              <p className="daloy-eyebrow" style={{ marginBottom: 6 }}>Creditor (paid)</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MemberAvatar member={creditor!} size={26} active />
                <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.84rem", fontWeight: 500, color: "var(--clay)" }}>
                  {creditor?.name}
                </span>
                {creditor?.isYou && (
                  <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.72rem", color: "var(--ink4)" }}>
                    · from {currentWallet?.icon} {currentWallet?.name}
                  </span>
                )}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--bg3)" }} />

            {/* Debts */}
            <div style={{ padding: "10px 16px" }}>
              <p className="daloy-eyebrow" style={{ marginBottom: 8 }}>Debt records ({debtors.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {debtors.map(debtor => (
                  <div key={debtor.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MemberAvatar member={debtor} size={22} />
                    <span style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.8rem", color: "var(--ink2)", flex: 1 }}>
                      <strong>{debtor.name.split(" ")[0]}</strong>
                      <span style={{ color: "var(--ink4)", fontWeight: 400 }}> owes {creditor?.name.split(" ")[0]}</span>
                    </span>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.8rem", fontWeight: 500, color: "var(--expense)" }}>
                      ₱{shareFor(debtor.id).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="daloy-btn-ghost" onClick={back} style={{ flexShrink: 0 }}>
              <ChevronLeft size={13} strokeWidth={1.5} style={{ display: "inline", marginRight: 2 }} />
              Back
            </button>
            <button
              className="daloy-btn-primary"
              onClick={handleSubmit}
              style={{ background: "var(--clay)", color: "white" }}
            >
              Confirm & Split
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}