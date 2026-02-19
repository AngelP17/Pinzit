import { useRunStore } from '../../store/run-store';
import { cn } from '../../lib/cn';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'findings', label: 'Findings' },
  { id: 'evidence', label: 'Evidence' },
] as const;

export function TabBar() {
  const activeTab = useRunStore((s) => s.activeTab);
  const setActiveTab = useRunStore((s) => s.setActiveTab);

  return (
    <nav className="panel mb-4 flex gap-2 p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
            activeTab === tab.id ? 'bg-surface-700 text-white' : 'text-zinc-300 hover:bg-surface-700/40'
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
