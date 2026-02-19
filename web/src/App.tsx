import { Suspense, lazy } from 'react';
import { Header } from './components/layout/Header';
import { Shell } from './components/layout/Shell';
import { TabBar } from './components/layout/TabBar';
import { DropzonePanel } from './components/dropzone/DropzonePanel';
import { EvidenceDrawer } from './components/evidence/EvidenceDrawer';
import { DiffMode } from './components/diff/DiffMode';
import { useRunStore } from './store/run-store';
import { useKeyboard } from './hooks/useKeyboard';

const OverviewTab = lazy(() =>
  import('./components/overview/OverviewTab').then((m) => ({ default: m.OverviewTab }))
);
const FindingsTab = lazy(() =>
  import('./components/findings/FindingsTab').then((m) => ({ default: m.FindingsTab }))
);
const EvidenceTab = lazy(() =>
  import('./components/evidence/EvidenceTab').then((m) => ({ default: m.EvidenceTab }))
);
const CompareModal = lazy(() =>
  import('./components/diff/CompareModal').then((m) => ({ default: m.CompareModal }))
);
const CommandPalette = lazy(() =>
  import('./components/command-palette/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);

function App() {
  useKeyboard();

  const run = useRunStore((s) => s.primaryRun);
  const comparisonRun = useRunStore((s) => s.comparisonRun);
  const activeTab = useRunStore((s) => s.activeTab);
  const mode = useRunStore((s) => s.viewMode);

  return (
    <Shell mode={mode}>
      <Header />
      <DropzonePanel />
      <DiffMode base={run} next={comparisonRun} />
      <TabBar />

      <Suspense fallback={<div className="panel p-4 text-sm text-zinc-400">Loading tab...</div>}>
        {activeTab === 'overview' && <OverviewTab run={run} />}
        {activeTab === 'findings' && <FindingsTab run={run} />}
        {activeTab === 'evidence' && <EvidenceTab run={run} />}
      </Suspense>

      <EvidenceDrawer run={run} />
      <Suspense fallback={null}>
        <CompareModal />
        <CommandPalette />
      </Suspense>
    </Shell>
  );
}

export default App;
