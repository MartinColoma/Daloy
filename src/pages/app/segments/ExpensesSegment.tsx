import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Users } from 'lucide-react'

// ── Modals ────────────────────────────────────────────────────────────────────
import AddExpenseModal    from '../../../components/modals/QuickActions/AddExpenseModal'
import GroupExpenseModal  from '../../../components/modals/QuickActions/GroupExpenseModal'

// ═══════════════════════════════════════════════════════════════
// LOCAL TYPES
// ═══════════════════════════════════════════════════════════════

type ExpenseTab = 'personal' | 'group'

// ═══════════════════════════════════════════════════════════════
// SUB-TAB TOGGLE
// ═══════════════════════════════════════════════════════════════

interface ExpenseTabToggleProps {
  active:   ExpenseTab
  onChange: (t: ExpenseTab) => void
}

function ExpenseTabToggle({ active, onChange }: ExpenseTabToggleProps) {
  return (
    <div
      className="inline-flex rounded-[var(--radius-sm)] p-[3px] gap-[2px]"
      style={{ background: 'var(--bg2)' }}
    >
      {([
        { key: 'personal' as const, label: 'Personal',  icon: null         },
        { key: 'group'    as const, label: 'Group',      icon: <Users size={11} /> },
      ]).map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-[5px] px-3 py-1 rounded-[4px] text-[0.78rem] font-medium transition-all"
            style={{
              background: isActive ? '#FFFFFF' : 'transparent',
              color:      isActive ? 'var(--ink)' : 'var(--ink4)',
              fontFamily: 'Outfit, sans-serif',
              boxShadow:  isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY CHIP
// ═══════════════════════════════════════════════════════════════

interface SummaryChipProps {
  label:   string
  amount:  number
  color:   string
  bgColor: string
}

function SummaryChip({ label, amount, color, bgColor }: SummaryChipProps) {
  const display = amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div
      className="flex flex-col gap-[2px] px-4 py-3 rounded-[var(--radius-md)]"
      style={{ background: bgColor }}
    >
      <span style={{
        fontFamily:    'Outfit, sans-serif',
        fontSize:      '0.72rem',
        fontWeight:    500,
        color:         'var(--ink3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize:   '1.1rem',
        fontWeight: 500,
        color,
      }}>
        ₱{display}
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// GROUP CARD (placeholder row)
// ═══════════════════════════════════════════════════════════════

interface GroupCardProps {
  name:          string
  icon:          string
  memberCount:   number
  totalExpenses: number
  youOwe:        number
  youAreOwed:    number
}

function GroupCard({ name, icon, memberCount, totalExpenses, youOwe, youAreOwed }: GroupCardProps) {
  const netBalance = youAreOwed - youOwe

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--bg3)' }}
    >
      {/* Left — icon + name + members */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center justify-center rounded-[var(--radius-sm)] shrink-0"
          style={{
            width:      '36px',
            height:     '36px',
            background: 'var(--bg2)',
            fontSize:   '1.1rem',
          }}
        >
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span style={{
            fontFamily:   'Outfit, sans-serif',
            fontSize:     '0.88rem',
            fontWeight:   500,
            color:        'var(--ink)',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {name}
          </span>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize:   '0.72rem',
            color:      'var(--ink4)',
          }}>
            {memberCount} members · ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
          </span>
        </div>
      </div>

      {/* Right — net balance */}
      <div className="flex flex-col items-end shrink-0 ml-4">
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize:   '0.88rem',
          fontWeight: 500,
          color:      netBalance >= 0 ? 'var(--income)' : 'var(--expense)',
        }}>
          {netBalance >= 0 ? '+' : ''}₱{Math.abs(netBalance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize:   '0.68rem',
          color:      'var(--ink4)',
        }}>
          {netBalance >= 0 ? 'you are owed' : 'you owe'}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PERSONAL PANEL
// ═══════════════════════════════════════════════════════════════

interface PersonalPanelProps {
  isDesktop:   boolean
  periodLabel: string
  addOpen:     boolean
  setAddOpen:  (v: boolean) => void
}

function PersonalPanel({ isDesktop, periodLabel, addOpen, setAddOpen }: PersonalPanelProps) {
  const addButton = (
    <button
      onClick={() => setAddOpen(true)}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '5px',
        fontFamily:   'Outfit, sans-serif',
        fontSize:     '0.8rem',
        fontWeight:   500,
        color:        'var(--expense)',
        background:   'var(--clay-bg)',
        border:       '1.5px solid var(--clay-m)',
        borderRadius: 'var(--radius-sm)',
        padding:      '5px 10px',
        cursor:       'pointer',
        transition:   'background 0.15s',
      }}
    >
      <Plus size={13} />
      {isDesktop ? 'Add Expense' : 'Add'}
    </button>
  )

  const summaryChip = (
    <SummaryChip
      label="Personal Expenses"
      amount={0}
      color="var(--expense)"
      bgColor="var(--clay-bg)"
    />
  )

  const emptyState = (
    <div style={{
      padding:    '48px 20px',
      textAlign:  'center',
      color:      'var(--ink4)',
      fontFamily: 'Outfit, sans-serif',
      fontSize:   '0.85rem',
    }}>
      No personal expenses for {periodLabel}.
    </div>
  )

  if (isDesktop) {
    return (
      <>
        <div className="flex gap-5">
          {/* Main list */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[1rem] font-semibold"
                  style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                >
                  Personal Expenses — {periodLabel}
                </h2>
                {addButton}
              </div>
              {emptyState}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] shrink-0">
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
            >
              <p
                className="text-[0.78rem] font-medium mb-3"
                style={{
                  color:         'var(--ink3)',
                  fontFamily:    'Outfit, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                This Month
              </p>
              {summaryChip}
            </div>
          </div>
        </div>

        <AddExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      </>
    )
  }

  // Mobile
  return (
    <>
      <div className="flex flex-col gap-4">
        {summaryChip}

        <div
          className="rounded-[var(--radius-md)] overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--bg3)' }}
          >
            <p
              className="font-outfit font-semibold text-[0.9rem]"
              style={{ color: 'var(--ink)' }}
            >
              Personal Expenses
            </p>
            {addButton}
          </div>
          <div style={{ padding: '12px' }}>
            {emptyState}
          </div>
        </div>
      </div>

      <AddExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// GROUP PANEL
// ═══════════════════════════════════════════════════════════════

// Placeholder groups for display — replace with useGroups() when wiring up
const PLACEHOLDER_GROUPS: GroupCardProps[] = [
  { name: 'Barkada Trip',  icon: '🏖️', memberCount: 5, totalExpenses: 12400,  youOwe: 1800, youAreOwed: 0    },
  { name: 'House Bills',   icon: '🏠', memberCount: 3, totalExpenses: 8750,   youOwe: 0,    youAreOwed: 2400 },
  { name: 'Office Lunch',  icon: '🍱', memberCount: 8, totalExpenses: 3200,   youOwe: 420,  youAreOwed: 0    },
]

interface GroupPanelProps {
  isDesktop:       boolean
  periodLabel:     string
  groupOpen:       boolean
  setGroupOpen:    (v: boolean) => void
}

function GroupPanel({ isDesktop, periodLabel, groupOpen, setGroupOpen }: GroupPanelProps) {
  const groups = PLACEHOLDER_GROUPS

  const totalGroupExpenses = groups.reduce((s, g) => s + g.totalExpenses, 0)
  const totalYouOwe        = groups.reduce((s, g) => s + g.youOwe, 0)
  const totalYouAreOwed    = groups.reduce((s, g) => s + g.youAreOwed, 0)

  const addButton = (
    <button
      onClick={() => setGroupOpen(true)}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '5px',
        fontFamily:   'Outfit, sans-serif',
        fontSize:     '0.8rem',
        fontWeight:   500,
        color:        'var(--steel)',
        background:   'var(--steel-bg)',
        border:       '1.5px solid var(--steel-m)',
        borderRadius: 'var(--radius-sm)',
        padding:      '5px 10px',
        cursor:       'pointer',
        transition:   'background 0.15s',
        opacity:      0.6,       // dim until wired — provisional
      }}
    >
      <Users size={13} />
      {isDesktop ? 'Group Expense' : 'Add'}
    </button>
  )

  const groupList = groups.length === 0 ? (
    <div style={{
      padding:    '48px 20px',
      textAlign:  'center',
      color:      'var(--ink4)',
      fontFamily: 'Outfit, sans-serif',
      fontSize:   '0.85rem',
    }}>
      No group expenses for {periodLabel}.
    </div>
  ) : (
    <div>
      {groups.map(g => (
        <GroupCard key={g.name} {...g} />
      ))}
    </div>
  )

  // ── Desktop sidebar summary cards ──────────────────────────────
  const sidebarSummary = (
    <div className="flex flex-col gap-3">
      {/* Total group spend */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
      >
        <p
          className="text-[0.78rem] font-medium mb-3"
          style={{
            color:         'var(--ink3)',
            fontFamily:    'Outfit, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          This Month
        </p>
        <SummaryChip
          label="Group Expenses"
          amount={totalGroupExpenses}
          color="var(--steel)"
          bgColor="var(--steel-bg)"
        />
      </div>

      {/* You owe / You are owed */}
      <div
        className="rounded-xl p-5 flex flex-col gap-3"
        style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
      >
        <p
          className="text-[0.78rem] font-medium"
          style={{
            color:         'var(--ink3)',
            fontFamily:    'Outfit, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Balances
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', color: 'var(--ink3)' }}>
              You owe
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.88rem', fontWeight: 500, color: 'var(--expense)' }}>
              ₱{totalYouOwe.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', color: 'var(--ink3)' }}>
              You are owed
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.88rem', fontWeight: 500, color: 'var(--income)' }}>
              ₱{totalYouAreOwed.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div
            style={{
              borderTop:  '1px solid var(--bg3)',
              paddingTop: '8px',
              marginTop:  '4px',
              display:    'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              Net
            </span>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize:   '0.95rem',
              fontWeight: 500,
              color:      (totalYouAreOwed - totalYouOwe) >= 0 ? 'var(--income)' : 'var(--expense)',
            }}>
              {(totalYouAreOwed - totalYouOwe) >= 0 ? '+' : ''}₱{Math.abs(totalYouAreOwed - totalYouOwe).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Mobile summary chips ───────────────────────────────────────
  const mobileSummaryRow = (
    <div className="flex gap-3">
      <div className="flex-1">
        <SummaryChip
          label="You Owe"
          amount={totalYouOwe}
          color="var(--expense)"
          bgColor="var(--clay-bg)"
        />
      </div>
      <div className="flex-1">
        <SummaryChip
          label="Owed to You"
          amount={totalYouAreOwed}
          color="var(--income)"
          bgColor="var(--forest-bg)"
        />
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <>
        <div className="flex gap-5">
          {/* Main list */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-xl p-5"
              style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[1rem] font-semibold"
                  style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                >
                  Group Expenses — {periodLabel}
                </h2>
                {addButton}
              </div>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--bg3)' }}>
                {groupList}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] shrink-0">
            {sidebarSummary}
          </div>
        </div>

        <GroupExpenseModal isOpen={groupOpen} onClose={() => setGroupOpen(false)} />
      </>
    )
  }

  // Mobile
  return (
    <>
      <div className="flex flex-col gap-4">
        {mobileSummaryRow}

        <div
          className="rounded-[var(--radius-md)] overflow-hidden"
          style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--bg3)' }}
          >
            <p
              className="font-outfit font-semibold text-[0.9rem]"
              style={{ color: 'var(--ink)' }}
            >
              Groups
            </p>
            {addButton}
          </div>
          <div>
            {groupList}
          </div>
        </div>
      </div>

      <GroupExpenseModal isOpen={groupOpen} onClose={() => setGroupOpen(false)} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// EXPENSES SEGMENT
// ═══════════════════════════════════════════════════════════════

interface ExpensesSegmentProps {
  isDesktop: boolean
}

export function ExpensesSegment({ isDesktop }: ExpensesSegmentProps) {
  const now         = new Date()
  const periodLabel = format(now, 'MMMM yyyy')

  const [activeTab,   setActiveTab]   = useState<ExpenseTab>('personal')
  const [addOpen,     setAddOpen]     = useState(false)
  const [groupOpen,   setGroupOpen]   = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tab toggle — always visible above the content */}
      <div className="flex items-center justify-between">
        <ExpenseTabToggle active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'personal' && (
        <PersonalPanel
          isDesktop={isDesktop}
          periodLabel={periodLabel}
          addOpen={addOpen}
          setAddOpen={setAddOpen}
        />
      )}

      {activeTab === 'group' && (
        <GroupPanel
          isDesktop={isDesktop}
          periodLabel={periodLabel}
          groupOpen={groupOpen}
          setGroupOpen={setGroupOpen}
        />
      )}
    </div>
  )
}