import type { GroupExpense } from '../../../types'
import { format } from 'date-fns'

interface GroupExpenseListProps {
  expenses: GroupExpense[]
  isLoading: boolean
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function GroupExpenseList({ expenses, isLoading }: GroupExpenseListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-lg animate-pulse"
            style={{ background: 'var(--bg2)' }}
          />
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <p
        className="text-[0.82rem] text-center py-6"
        style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
      >
        No expenses yet. Add one via Quick Actions → Group Expense.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--bg2)' }}
        >
          {/* Left — description + date */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span
              className="text-[0.85rem] font-medium truncate"
              style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
            >
              {expense.description ?? 'Group expense'}
            </span>
            <span
              className="text-[0.65rem]"
              style={{ color: 'var(--ink4)', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {format(new Date(expense.transactedAt), 'MMM d, yyyy')}
            </span>
          </div>

          {/* Right — amount */}
          <span
            className="text-[0.9rem] font-medium shrink-0 ml-3"
            style={{ color: 'var(--expense)', fontFamily: 'IBM Plex Mono, monospace' }}
          >
            ₱{fmt(expense.totalAmount)}
          </span>
        </div>
      ))}
    </div>
  )
}