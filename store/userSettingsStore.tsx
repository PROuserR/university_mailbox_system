import { create } from 'zustand'

type UserSettingsStore = {
    isUserSettingsShown: boolean
    triggerUserSettings: () => void
}

const useUserSettingsStore = create<UserSettingsStore>()((set) => ({
    isUserSettingsShown: false,
    triggerUserSettings: () => set((state) => ({ isUserSettingsShown: !state.isUserSettingsShown })),
}))

export default useUserSettingsStore;