import { create } from 'zustand'

type userSettingsOverlayStore = {
    isUserSettingsShown: boolean
    triggerUserSettings: () => void
}

const userSettingsOverlayStore = create<userSettingsOverlayStore>()((set) => ({
    isUserSettingsShown: false,
    triggerUserSettings: () => set((state) => ({ isUserSettingsShown: !state.isUserSettingsShown })),
}))

export default userSettingsOverlayStore;