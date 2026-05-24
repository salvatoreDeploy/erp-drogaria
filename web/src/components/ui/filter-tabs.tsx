export interface FilterTab<T extends string> {
  id: T
  label: string
  count?: number
}

export interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[]
  active: T
  onChange: (id: T) => void
}

export function FilterTabs<T extends string>({ tabs, active, onChange }: FilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            'flex h-8 items-center gap-1.5 rounded-xl border px-3 font-medium text-[12px] transition-colors',
            active === tab.id
              ? 'border-brand-700 bg-brand-75 text-brand-750'
              : 'border-brand-100 bg-white text-brand-muted hover:bg-brand-50',
          ].join(' ')}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={[
                'rounded-full px-1.5 py-0.5 font-bold text-[10px]',
                active === tab.id ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-muted',
              ].join(' ')}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
