import { useRunStore } from '../../store/run-store';
import { cn } from '../../lib/cn';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'findings', label: 'Findings' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'ci-gate', label: 'CI Gate' },
] as const;

export function TabBar() {
  const activeTab = useRunStore((s) => s.activeTab);
  const setActiveTab = useRunStore((s) => s.setActiveTab);

  return (
    <nav className="rule-b mb-7 flex gap-7 pb-3">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative pb-2 text-[13px] tracking-tight transition-colors focus-visible:outline-none',
              active ? 'text-white' : 'text-ink-2 hover:text-ink-1',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'absolute -bottom-px left-0 right-0 h-px transition-colors',
                active ? 'bg-signal' : 'bg-transparent',
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
