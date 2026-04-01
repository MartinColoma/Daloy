import type { Group } from '@/types'
import { useGroupStore } from '../../stores/groupStore'
import { GroupCard } from '../groups/GroupCard'

interface GroupsOverviewProps {
  groups: Group[]
  isLoading: boolean
}

export function GroupsOverview({ groups, isLoading }: GroupsOverviewProps) {
const activeGroupId = useGroupStore((s) => s.activeGroupId)
const setActiveGroup = useGroupStore((s) => s.setActiveGroup)

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#FFFFFF', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[1rem] font-semibold"
          style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
        >
          Groups
        </h2>
        <button
          className="text-[0.78rem] font-medium"
          style={{ color: 'var(--forest)', fontFamily: 'Outfit, sans-serif' }}
        >
          + New Group
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ background: 'var(--bg2)' }}
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p
          className="text-[0.85rem] text-center py-8"
          style={{ color: 'var(--ink4)', fontFamily: 'Outfit, sans-serif' }}
        >
          No groups yet. Create one to start splitting expenses.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={group.id === activeGroupId}
              onSelect={() => setActiveGroup(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}