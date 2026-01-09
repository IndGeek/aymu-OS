import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Folder,
  Terminal,
  Settings,
  Store,
  FileText,
  Calculator,
  Activity,
  Info,
  Globe,
  Mail,
  Calendar,
  Image,
  Music,
  MessageSquare,
  PencilRuler,
} from 'lucide-react';
import type { AppDefinition, AppCategory } from '@/types/os';
import { AppIcons } from '@/icons/app-icon';

interface AppStore {
  apps: Omit<AppDefinition, 'component'>[];
  installedAppIds: string[];
  pinnedAppIds: string[];

  // App Management
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  isInstalled: (appId: string) => boolean;
  getApp: (appId: string) => Omit<AppDefinition, 'component'> | undefined;
  getAppsByCategory: (category: AppCategory) => Omit<AppDefinition, 'component'>[];
  getDockApps: () => Omit<AppDefinition, 'component'>[];

  // Dock Management
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  getInstalledApps: () => Omit<AppDefinition, 'component'>[];
}

const defaultApps: Omit<AppDefinition, 'component'>[] = [
  {
    id: 'finder',
    name: 'Finder',
    icon: AppIcons.Finder,
    iconBg: 'bg-gradient-to-br from-blue-300 via-blue-600 to-blue-600',
    category: 'system',
    description: 'Browse and manage files',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: AppIcons.Terminal,
    iconBg: 'bg-gradient-to-br from-gray-600 via-gray-800 to-gray-900',
    category: 'development',
    description: 'Command line interface',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: AppIcons.Settings,
    iconBg: 'bg-gradient-to-br from-gray-300 via-gray-600 to-gray-700',
    category: 'system',
    description: 'Configure your system',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'appstore',
    name: 'App Store',
    icon: AppIcons.AppStore,
    iconBg: 'bg-gradient-to-br from-indigo-300 via-indigo-600 to-indigo-600',
    category: 'system',
    description: 'Download and manage apps',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: AppIcons.Notepad,
    iconBg: 'bg-gradient-to-br from-yellow-300 via-amber-600 to-amber-600',
    category: 'productivity',
    description: 'Edit text files',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    iconBg: 'bg-gradient-to-br from-gray-600 to-gray-800',
    category: 'utilities',
    description: 'Perform calculations',
    isSystemApp: false,
    isInstalled: false,
  },
  {
    id: 'mail',
    name: 'Mail',
    icon: Mail,
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    category: 'productivity',
    description: 'Send and receive emails',
    isSystemApp: false,
    isInstalled: false,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: Calendar,
    iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
    category: 'productivity',
    description: 'Manage your schedule',
    isSystemApp: false,
    isInstalled: false,
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: Image,
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-500',
    category: 'media',
    description: 'View and manage photos',
    isSystemApp: false,
    isInstalled: false,
  },
  {
    id: 'music',
    name: 'Music',
    icon: AppIcons.Music,
    iconBg: 'bg-gradient-to-br from-pink-300 via-pink-700 to-red-600',
    category: 'media',
    description: 'Play your favorite music',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'browser',
    name: 'Browser',
    icon: AppIcons.Browser,
    iconBg: 'bg-gradient-to-br from-green-300 via-green-800 to-teal-800',
    category: 'productivity',
    description: 'Browse the web',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'photopea',
    name: 'Photopea',
    icon: AppIcons.Photopea,
    iconBg: 'bg-gradient-to-br from-red-300 via-red-600 to-red-600',
    category: 'media',
    description: 'Edit amazing photos',
    isSystemApp: false,
    isInstalled: true,
  },
  {
    id: 'messages',
    name: 'Messages',
    icon: MessageSquare,
    iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    category: 'productivity',
    description: 'Chat with friends',
    isSystemApp: false,
    isInstalled: false,
  },
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    icon: PencilRuler,
    iconBg: 'bg-gradient-to-br from-indigo-500 via-indigo-800 to-indigo-600',
    category: 'productivity',
    description: 'Draw amazing diagrams',
    isSystemApp: true,
    isInstalled: true,
  },
];

const systemAppIds = defaultApps.filter(app => app.isSystemApp).map(app => app.id);

const defaultPinnedAppIds = ['finder', 'terminal', 'settings', 'appstore', 'music', 'browser', 'excalidraw', 'photopea'];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      apps: defaultApps,
      installedAppIds: systemAppIds,
      pinnedAppIds: defaultPinnedAppIds,

      installApp: (appId) => {
        set((state) => ({
          installedAppIds: [...new Set([...state.installedAppIds, appId])],
        }));
      },

      uninstallApp: (appId) => {
        const app = get().getApp(appId);
        if (app?.isSystemApp) return; // Can't uninstall system apps

        set((state) => ({
          installedAppIds: state.installedAppIds.filter(id => id !== appId),
          pinnedAppIds: state.pinnedAppIds.filter(id => id !== appId),
        }));
      },

      isInstalled: (appId) => get().installedAppIds.includes(appId),

      getApp: (appId) => get().apps.find(app => app.id === appId),

      getAppsByCategory: (category) =>
        get().apps.filter(app => app.category === category),

      getDockApps: () => {
        const { apps, pinnedAppIds } = get();
        return apps.filter(app => pinnedAppIds.includes(app.id));
      },

      pinApp: (appId) => {
        set((state) => ({
          pinnedAppIds: [...new Set([...state.pinnedAppIds, appId])],
        }));
      },

      unpinApp: (appId) => {
        set((state) => ({
          pinnedAppIds: state.pinnedAppIds.filter(id => id !== appId),
        }));
      },

      isPinned: (appId) => get().pinnedAppIds.includes(appId),

      getInstalledApps: () => {
        const { apps, installedAppIds } = get();
        return apps.filter(app => installedAppIds.includes(app.id));
      },
    }),
    {
      name: 'aymu-os-apps',
      partialize: (state) => ({
        installedAppIds: state.installedAppIds,
        pinnedAppIds: state.pinnedAppIds,
      }),
    }
  )
);
