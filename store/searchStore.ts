// store/searchStore.ts - الإصدار النهائي

import { create } from "zustand";

interface SearchStore {
  searchQuery: string;
  currentPage: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: "",
  currentPage: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentPage: (page) => set({ currentPage: page, searchQuery: "" }),
  clearSearch: () => set({ searchQuery: "" }),
}));