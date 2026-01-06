import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/stores/systemStore';
import { Dock } from './Dock';
import { TopBar } from './TopBar';
import { WindowManager } from './WindowManager';

// Accent color mappings to HSL values
const accentColorMap: Record<string, { primary: string; ring: string; dockIndicator: string; sidebarPrimary: string; sidebarRing: string }> = {
  indigo: {
    primary: '230 85% 55%',
    ring: '230 85% 55%',
    dockIndicator: '230 85% 55%',
    sidebarPrimary: '230 85% 55%',
    sidebarRing: '230 85% 55%',
  },
  cyan: {
    primary: '190 85% 55%',
    ring: '190 85% 55%',
    dockIndicator: '190 85% 55%',
    sidebarPrimary: '190 85% 55%',
    sidebarRing: '190 85% 55%',
  },
  orange: {
    primary: '25 95% 55%',
    ring: '25 95% 55%',
    dockIndicator: '25 95% 55%',
    sidebarPrimary: '25 95% 55%',
    sidebarRing: '25 95% 55%',
  },
  amber: {
    primary: '45 95% 55%',
    ring: '45 95% 55%',
    dockIndicator: '45 95% 55%',
    sidebarPrimary: '45 95% 55%',
    sidebarRing: '45 95% 55%',
  },
  emerald: {
    primary: '150 70% 50%',
    ring: '150 70% 50%',
    dockIndicator: '150 70% 50%',
    sidebarPrimary: '150 70% 50%',
    sidebarRing: '150 70% 50%',
  },
  pink: {
    primary: '330 80% 65%',
    ring: '330 80% 65%',
    dockIndicator: '330 80% 65%',
    sidebarPrimary: '330 80% 65%',
    sidebarRing: '330 80% 65%',
  },
  purple: {
    primary: '280 70% 60%',
    ring: '280 70% 60%',
    dockIndicator: '280 70% 60%',
    sidebarPrimary: '280 70% 60%',
    sidebarRing: '280 70% 60%',
  },
};

export function Desktop() {
  const settings = useSystemStore((state) => state.settings);
  const updateTime = useSystemStore((state) => state.updateTime);

  // Apply accent color to CSS variables
  useEffect(() => {
    const accentColor = accentColorMap[settings.accentColor] || accentColorMap.indigo;
    const root = document.documentElement;
    
    root.style.setProperty('--primary', accentColor.primary);
    root.style.setProperty('--ring', accentColor.ring);
    root.style.setProperty('--dock-indicator', accentColor.dockIndicator);
    root.style.setProperty('--sidebar-primary', accentColor.sidebarPrimary);
    root.style.setProperty('--sidebar-ring', accentColor.sidebarRing);
  }, [settings.accentColor]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  const getWallpaperUrl = () => {
    switch (settings.wallpaper) {
      case 'mountain': return '/wallpapers/mountain.jpg';
      case 'cosmos': return '/wallpapers/cosmos.jpg';
      case 'voyage': return '/wallpapers/voyage.jpg';
      default: return '/wallpapers/mountain.jpg';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${getWallpaperUrl()})` }}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <TopBar />

      <div className="absolute inset-0 pt-7">
        <WindowManager />
      </div>

      <Dock />
    </motion.div>
  );
}
