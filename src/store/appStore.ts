import { create } from 'zustand';
import type { Script, Store } from '@/types';

interface AppState {
  currentStore: Store | null;
  currentScript: Script | null;
  scripts: Script[];
  stores: Store[];

  setCurrentStore: (store: Store | null) => void;
  setCurrentScript: (script: Script | null) => void;
  setScripts: (scripts: Script[]) => void;
  setStores: (stores: Store[]) => void;
  addScript: (script: Script) => void;
  updateScript: (scriptId: string, script: Partial<Script>) => void;
  removeScript: (scriptId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStore: null,
  currentScript: null,
  scripts: [],
  stores: [],

  setCurrentStore: (store) => set({ currentStore: store }),
  setCurrentScript: (script) => set({ currentScript: script }),
  setScripts: (scripts) => set({ scripts }),
  setStores: (stores) => set({ stores }),

  addScript: (script) => set((state) => ({
    scripts: [...state.scripts, script]
  })),

  updateScript: (scriptId, updates) => set((state) => ({
    scripts: state.scripts.map((s) =>
      s.id === scriptId ? { ...s, ...updates } : s
    ),
  })),

  removeScript: (scriptId) => set((state) => ({
    scripts: state.scripts.filter((s) => s.id !== scriptId),
  })),
}));
