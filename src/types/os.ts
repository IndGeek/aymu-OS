import { LucideIcon } from 'lucide-react';

// System States
export type SystemState = 'booting' | 'login' | 'desktop';
export type WallpaperType = 'mountain' | 'cosmos' | 'voyage';

// User
export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

// Window
export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  fileId?: string;
}

// App
export interface AppDefinition {
  id: string;
  name: string;
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  category: AppCategory;
  description: string;
  isSystemApp: boolean;
  isInstalled: boolean;
  component: React.ComponentType<AppComponentProps>;
}

export type AppCategory = 'system' | 'productivity' | 'media' | 'utilities' | 'development';

export interface AppComponentProps {
  windowId: string;
}

// Menu
export interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

export interface MenuBar {
  appName: string;
  menus: { label: string; items: MenuItem[] }[];
}

// File System
export type FileType = 'file' | 'folder';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileType;
  path: string;
  parentId: string | null;
  content?: string;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
  icon?: string;
}

// System Tray
export interface SystemTrayItem {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  appId?: string;
  timestamp: Date;
  read: boolean;
}

// Settings
export interface SystemSettings {
  wallpaper: WallpaperType;
  accentColor: string;
  soundEnabled: boolean;
  volume: number;
  developerMode: boolean;
}

// Developer File System Node (with permissions)
export interface DevFileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  content?: string;
  children?: DevFileSystemNode[];
}

// Boot Log
export interface BootLogEntry {
  text: string;
  color: 'cyan' | 'magenta' | 'green' | 'yellow' | 'red' | 'white';
  delay: number;
}

export type BatteryState = {
  batteryLevel: number | null;
  charging: boolean | null;
};