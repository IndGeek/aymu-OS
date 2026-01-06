import { create } from 'zustand';
import type { WindowState } from '@/types/os';
import { soundManager } from '@/lib/sounds';

interface WindowStore {
  windows: WindowState[];
  nextZIndex: number;

  // Window Management
  openWindow: (appId: string, title: string, initialSize?: { width: number; height: number }, fileId?: string) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;

  // Position & Size
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;

  // Getters
  getWindow: (id: string) => WindowState | undefined;
  getFocusedWindow: () => WindowState | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZIndex: 100,

  openWindow: (appId, title, initialSize, fileId) => {
    const id = generateId();
    const { nextZIndex, windows } = get();

    // Calculate center position with cascading offset for all windows
    const existingCount = windows.length;
    const offset = existingCount * 30;

    const width = initialSize?.width || 800;
    const height = initialSize?.height || 600;
    const x = Math.max(100, (window.innerWidth - width) / 2 + offset);
    const y = Math.max(60, (window.innerHeight - height) / 2 + offset);

    const newWindow: WindowState = {
      id,
      appId,
      title,
      x,
      y,
      width,
      height,
      minWidth: 400,
      minHeight: 300,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: nextZIndex,
      fileId,
    };

    set((state) => ({
      windows: [
        ...state.windows.map(w => ({ ...w, isFocused: false })),
        newWindow,
      ],
      nextZIndex: nextZIndex + 1,
    }));

    soundManager.playTick();
    return id;
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== id),
    }));
    soundManager.playTick();
  },

  focusWindow: (id) => {
    const { nextZIndex } = get();

    set((state) => ({
      windows: state.windows.map(w => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? nextZIndex : w.zIndex,
        isMinimized: w.id === id ? false : w.isMinimized,
      })),
      nextZIndex: nextZIndex + 1,
    }));

    soundManager.playFocus();
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    }));
    soundManager.playTick();
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id
          ? {
            ...w,
            isMaximized: true,
            x: 0,
            y: 28,
            width: window.innerWidth,
            height: window.innerHeight - 28,
          }
          : w
      ),
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id
          ? {
            ...w,
            isMaximized: false,
            x: 100,
            y: 100,
            width: 800,
            height: 600,
          }
          : w
      ),
    }));
  },

  updateWindowPosition: (id, x, y) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, x, y } : w
      ),
    }));
  },

  updateWindowSize: (id, width, height) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, width, height } : w
      ),
    }));
  },

  getWindow: (id) => get().windows.find(w => w.id === id),

  getFocusedWindow: () => get().windows.find(w => w.isFocused),
}));
