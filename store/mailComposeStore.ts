import { create } from 'zustand'

type MailComposeStore = {
    isMailComposeShown: boolean
    triggerMailCompose: () => void
}

const useMailComposeStore = create<MailComposeStore>()((set) => ({
    isMailComposeShown: false,
    triggerMailCompose: () => set((state) => ({ isMailComposeShown: !state.isMailComposeShown })),
}))

export default useMailComposeStore;