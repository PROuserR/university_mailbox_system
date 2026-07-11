// store/uiModeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIMode = 'classic' | 'modern';

interface UIModeStore {
    uiMode: UIMode;
    setUIMode: (mode: UIMode) => void;
    toggleUIMode: () => void;
}

const useUIModeStore = create<UIModeStore>()(
    persist(
        (set) => ({
            uiMode: 'classic',
            setUIMode: (mode) => set({ uiMode: mode }),
            toggleUIMode: () => set((state) => ({
                uiMode: state.uiMode === 'classic' ? 'modern' : 'classic'
            })),
        }),
        {
            name: 'ui-mode-storage',
        }
    )
);

export default useUIModeStore;