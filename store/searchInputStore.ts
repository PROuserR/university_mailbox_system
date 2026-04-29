import { create } from 'zustand'

type SearchInputStore = {
    seachInput: string
    setSearchInput: (inputValue: string) => void
}

const useSearchInputStore = create<SearchInputStore>()((set) => ({
    seachInput: "",
    setSearchInput: (inputValue) => set((state) => ({ seachInput: inputValue })),
}))

export default useSearchInputStore;