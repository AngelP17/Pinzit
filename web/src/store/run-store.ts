import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConstraintId, RunBundle, VerdictState } from '../types/pinzit';

type ViewMode = 'audit' | 'explore' | 'focus';
type ActiveTab = 'overview' | 'findings' | 'evidence' | 'timeline' | 'ci-gate';
type ToastTone = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs?: number;
};

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
  toasts: Toast[];
  setPrimaryRun: (run: RunBundle | null) => void;
  setComparisonRun: (run: RunBundle | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setViewMode: (mode: ViewMode) => void;
  openEvidence: (target: ConstraintId) => void;
  closeEvidence: () => void;
  setPaletteOpen: (open: boolean) => void;
  setCompareModalOpen: (open: boolean) => void;
  setVerdictFilter: (values: VerdictState[]) => void;
  addToast: (message: string, tone: ToastTone, durationMs?: number) => void;
  removeToast: (id: string) => void;
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
      toasts: [],
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
      addToast: (message, tone, durationMs) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              message,
              tone,
              durationMs,
            },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
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
