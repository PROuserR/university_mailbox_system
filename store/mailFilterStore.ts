import { create } from "zustand";

type MailFilterStore = {
    filter: string;
    setFilter: (filter: string) => void;
};

const useMailFilterStore = create<MailFilterStore>((set) => ({
    filter: "",
    setFilter: (filter) => set({ filter }),
}));

export default useMailFilterStore;