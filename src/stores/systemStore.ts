import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemState, User, WallpaperType, SystemSettings } from '@/types/os';

interface SystemStore {
  // System State
  systemState: SystemState;
  setSystemState: (state: SystemState) => void;

  // Current User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Active App (for menu bar)
  activeAppId: string | null;
  setActiveAppId: (appId: string | null) => void;

  // Time
  currentTime: Date;
  updateTime: () => void;
}

const defaultSettings: SystemSettings = {
  wallpaper: 'mountain',
  accentColor: 'amber',
  soundEnabled: true,
  volume: 0.5,
  developerMode: false,
};

const defaultUsers: User[] = [
  { id: 'user', name: 'User', username: 'user' },
  { id: 'guest', name: 'Guest', username: 'guest' },
];

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      systemState: 'booting',
      setSystemState: (state) => set({ systemState: state }),

      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      activeAppId: null,
      setActiveAppId: (appId) => set({ activeAppId: appId }),

      currentTime: new Date(),
      updateTime: () => set({ currentTime: new Date() }),
    }),
    {
      name: 'aymu-os-system',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export { defaultUsers };
