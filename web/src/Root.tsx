import { Suspense, lazy, useState } from 'react';
import App from './App';
import { ToastViewport } from './components/shared/ToastViewport';
import { useRunStore } from './store/run-store';
import { loadSamplePass } from './lib/sample-data';

const LandingPage = lazy(() => import('./components/landing/LandingPage'));

type View = 'landing' | 'dashboard';

export function Root() {
  const [view, setView] = useState<View>('landing');
  const setPrimaryRun = useRunStore((s) => s.setPrimaryRun);
  const addToast = useRunStore((s) => s.addToast);

  const handleLaunch = () => {
    try {
      const run = loadSamplePass();
      setPrimaryRun(run);
      addToast('Control Room loaded', 'success');
      setView('dashboard');
    } catch {
      addToast('Failed to load sample run', 'error');
    }
  };

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        {view === 'landing' ? (
          <LandingPage onLaunch={handleLaunch} />
        ) : (
          <App onBack={() => setView('landing')} />
        )}
      </Suspense>
      <ToastViewport />
    </>
  );
}
