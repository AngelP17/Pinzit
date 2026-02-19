import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConstraintId, RunBundle, VerdictState } from '../types/pinzit';

type ViewMode = 'audit' | 'explore' | 'focus';
type ActiveTab = 'overview' | 'findings' | 'evidence';

type State = {
  primaryRun: RunBundle | null;
  comparisonRun: RunBundle | null;
  activeTab: ActiveTab;
  viewMode: ViewMode;
  evidenceTarget: ConstraintId | null;
  drawerOpen: boolean;
  paletteOpen: boolean;
  compareModalOpen: boolean;
  verdictFilter: VerdictState[];
  setPrimaryRun: (run: RunBundle | null) => void;
  setComparisonRun: (run: RunBundle | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setViewMode: (mode: ViewMode) => void;
  openEvidence: (target: ConstraintId) => void;
  closeEvidence: () => void;
  setPaletteOpen: (open: boolean) => void;
  setCompareModalOpen: (open: boolean) => void;
  setVerdictFilter: (values: VerdictState[]) => void;
};

export const useRunStore = create<State>()(
  persist(
    (set) => ({
      primaryRun: null,
      comparisonRun: null,
      activeTab: 'overview',
      viewMode: 'audit',
      evidenceTarget: null,
      drawerOpen: false,
      paletteOpen: false,
      compareModalOpen: false,
      verdictFilter: ['PASS', 'FAIL', 'SKIPPED'],
      setPrimaryRun: (run) => set({ primaryRun: run }),
      setComparisonRun: (run) => set({ comparisonRun: run }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setViewMode: (mode) => set({ viewMode: mode }),
      openEvidence: (target) =>
        set({ evidenceTarget: target, drawerOpen: true, activeTab: 'evidence' }),
      closeEvidence: () => set({ drawerOpen: false }),
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setCompareModalOpen: (open) => set({ compareModalOpen: open }),
      setVerdictFilter: (values) => set({ verdictFilter: values }),
    }),
    {
      name: 'pinzit-ui-v1',
      partialize: (state) => ({
        primaryRun: state.primaryRun,
        comparisonRun: state.comparisonRun,
        activeTab: state.activeTab,
        viewMode: state.viewMode,
        evidenceTarget: state.evidenceTarget,
        drawerOpen: state.drawerOpen,
        verdictFilter: state.verdictFilter,
      }),
    }
  )
);
