import { useEffect } from 'react';
import { useRunStore } from '../store/run-store';

export function useKeyboard() {
  const setActiveTab = useRunStore((s) => s.setActiveTab);
  const setPaletteOpen = useRunStore((s) => s.setPaletteOpen);
  const closeEvidence = useRunStore((s) => s.closeEvidence);
  const setCompareModalOpen = useRunStore((s) => s.setCompareModalOpen);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEvidence();
        setPaletteOpen(false);
        setCompareModalOpen(false);
        return;
      }

      const cmd = event.metaKey || event.ctrlKey;
      if (!cmd) return;

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }

      if (event.key === '1') {
        event.preventDefault();
        setActiveTab('overview');
      }
      if (event.key === '2') {
        event.preventDefault();
        setActiveTab('findings');
      }
      if (event.key === '3') {
        event.preventDefault();
        setActiveTab('evidence');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeEvidence, setActiveTab, setCompareModalOpen, setPaletteOpen]);
}
