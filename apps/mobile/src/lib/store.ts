import { create } from "zustand";

type AppState = {
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  setOnboarded: (value) => set({ isOnboarded: value }),
  recentSearches: [],
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, 10),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
