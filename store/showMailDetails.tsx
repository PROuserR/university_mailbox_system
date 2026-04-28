import { create } from 'zustand'

type ShowMailDetailsStore = {
    isMailDetailsStoreShown: boolean
    triggerMailDetailsStoreShown: () => void
}

const useShowMailDetailsStore = create<ShowMailDetailsStore>()((set) => ({
    isMailDetailsStoreShown: false,
    triggerMailDetailsStoreShown: () => set((state) => ({ isMailDetailsStoreShown: !state.isMailDetailsStoreShown })),
}))

export default useShowMailDetailsStore;