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
} from 'lucide-react';
import type { AppDefinition, AppCategory } from '@/types/os';

interface AppStore {
  apps: Omit<AppDefinition, 'component'>[];
  installedAppIds: string[];

  // App Management
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  isInstalled: (appId: string) => boolean;
  getApp: (appId: string) => Omit<AppDefinition, 'component'> | undefined;
  getAppsByCategory: (category: AppCategory) => Omit<AppDefinition, 'component'>[];
  getDockApps: () => Omit<AppDefinition, 'component'>[];
}

const defaultApps: Omit<AppDefinition, 'component'>[] = [
  {
    id: 'finder',
    name: 'Finder',
    icon: Folder,
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    category: 'system',
    description: 'Browse and manage files',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    iconBg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    category: 'development',
    description: 'Command line interface',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    iconBg: 'bg-gradient-to-br from-gray-500 to-gray-700',
    category: 'system',
    description: 'Configure your system',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'appstore',
    name: 'App Store',
    icon: Store,
    iconBg: 'bg-gradient-to-br from-indigo-800 to-blue-500',
    category: 'system',
    description: 'Download and manage apps',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: FileText,
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
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
    icon: Music,
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    category: 'media',
    description: 'Play your favorite music',
    isSystemApp: true,
    isInstalled: true,
  },
  {
    id: 'browser',
    name: 'Browser',
    icon: Globe,
    iconBg: 'bg-gradient-to-br from-green-400 via-green-800 to-teal-800',
    category: 'productivity',
    description: 'Browse the web',
    isSystemApp: true,
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
];

const systemAppIds = defaultApps.filter(app => app.isSystemApp).map(app => app.id);

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      apps: defaultApps,
      installedAppIds: systemAppIds,

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
        }));
      },

      isInstalled: (appId) => get().installedAppIds.includes(appId),

      getApp: (appId) => get().apps.find(app => app.id === appId),

      getAppsByCategory: (category) =>
        get().apps.filter(app => app.category === category),

      getDockApps: () => {
        const { apps, installedAppIds } = get();
        return apps.filter(app => installedAppIds.includes(app.id));
      },
    }),
    {
      name: 'aymu-os-apps',
      partialize: (state) => ({ installedAppIds: state.installedAppIds }),
    }
  )
);
