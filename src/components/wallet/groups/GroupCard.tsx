import type { Group } from '../../../types'

interface GroupCardProps {
  group: Group
  isActive: boolean
  onSelect: () => void
}

export function GroupCard({ group, isActive, onSelect }: GroupCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
      style={{
        background: isActive ? 'var(--forest-bg)' : 'var(--bg2)',
        border: `1.5px solid ${isActive ? 'var(--forest-xl)' : 'transparent'}`,
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
        style={{ background: isActive ? 'var(--forest-xl)' : 'var(--bg3)' }}
      >
        {group.icon ? (
          <span className="text-[1rem] leading-none">{group.icon}</span>
        ) : (
          <span
            className="text-[0.78rem] font-semibold"
            style={{ color: isActive ? 'var(--forest)' : 'var(--ink3)', fontFamily: 'Outfit, sans-serif' }}
          >
            {group.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <span
        className="text-[0.88rem] font-medium flex-1 min-w-0 truncate"
        style={{
          color: isActive ? 'var(--forest)' : 'var(--ink)',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {group.name}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: 'var(--forest)' }}
        />
      )}
    </button>
  )
}