// store/sidebarToggleStore.ts

import { create } from 'zustand'

type SidebarToggleStore = {
    isSidebarToggleShown: boolean
    triggerSidebar: () => void
}

const useSidebarToggleStore = create<SidebarToggleStore>()((set) => ({
    isSidebarToggleShown: true, 
    triggerSidebar: () => set((state) => ({ 
        isSidebarToggleShown: !state.isSidebarToggleShown 
    })),
}))

export default useSidebarToggleStore