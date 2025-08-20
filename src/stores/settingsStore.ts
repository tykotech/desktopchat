// src/stores/settingsStore.ts
import { create } from "zustand";

interface SettingsState {
  theme: "light" | "dark";
  language: string;
  sidebarCollapsed: boolean;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  language: "en",
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));