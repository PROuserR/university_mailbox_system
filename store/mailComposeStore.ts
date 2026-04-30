import { create } from 'zustand'

type MailComposeStore = {
    isMailComposeShown: boolean
    tiggerMailCompose: () => void
}

const useMailComposeStore = create<MailComposeStore>()((set) => ({
    isMailComposeShown: false,
    tiggerMailCompose: () => set((state) => ({ isMailComposeShown: !state.isMailComposeShown })),
}))

export default useMailComposeStore;