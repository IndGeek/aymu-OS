import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, 
  Wifi, 
  Volume2, 
  VolumeX,
  ChevronDown 
} from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { useAppStore } from '@/stores/appStore';
import { soundManager } from '@/lib/sounds';
import type { MenuItem } from '@/types/os';

const appMenus: Record<string, { label: string; items: MenuItem[] }[]> = {
  finder: [
    { label: 'File', items: [
      { label: 'New Finder Window', shortcut: '⌘N' },
      { label: 'New Folder', shortcut: '⇧⌘N' },
      { divider: true, label: '' },
      { label: 'Close Window', shortcut: '⌘W' },
    ]},
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z' },
      { divider: true, label: '' },
      { label: 'Cut', shortcut: '⌘X' },
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' },
    ]},
    { label: 'View', items: [
      { label: 'as Icons' },
      { label: 'as List' },
      { label: 'as Columns' },
    ]},
    { label: 'Window', items: [
      { label: 'Minimize', shortcut: '⌘M' },
      { label: 'Zoom' },
    ]},
    { label: 'Help', items: [
      { label: 'Finder Help' },
    ]},
  ],
  terminal: [
    { label: 'Shell', items: [
      { label: 'New Window', shortcut: '⌘N' },
      { label: 'New Tab', shortcut: '⌘T' },
    ]},
    { label: 'Edit', items: [
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' },
      { label: 'Clear', shortcut: '⌘K' },
    ]},
    { label: 'View', items: [
      { label: 'Bigger Font', shortcut: '⌘+' },
      { label: 'Smaller Font', shortcut: '⌘-' },
    ]},
    { label: 'Window', items: [
      { label: 'Minimize', shortcut: '⌘M' },
    ]},
    { label: 'Help', items: [
      { label: 'Terminal Help' },
    ]},
  ],
  settings: [
    { label: 'General', items: [] },
    { label: 'Appearance', items: [] },
    { label: 'Network', items: [] },
  ],
  default: [
    { label: 'File', items: [
      { label: 'Close', shortcut: '⌘W' },
    ]},
    { label: 'Edit', items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Cut', shortcut: '⌘X' },
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' },
    ]},
    { label: 'View', items: [] },
    { label: 'Window', items: [
      { label: 'Minimize', shortcut: '⌘M' },
    ]},
    { label: 'Help', items: [] },
  ],
};

export function TopBar() {
  const currentTime = useSystemStore((state) => state.currentTime);
  const settings = useSystemStore((state) => state.settings);
  const updateSettings = useSystemStore((state) => state.updateSettings);
  const activeAppId = useSystemStore((state) => state.activeAppId);
  const getApp = useAppStore((state) => state.getApp);
  const getFocusedWindow = useWindowStore((state) => state.getFocusedWindow);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const focusedWindow = getFocusedWindow();
  const activeApp = focusedWindow ? getApp(focusedWindow.appId) : null;
  const menus = appMenus[activeApp?.id || 'default'] || appMenus.default;

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (label: string) => {
    soundManager.playTick();
    setOpenMenu(openMenu === label ? null : label);
  };

  const toggleSound = () => {
    soundManager.playTick();
    updateSettings({ soundEnabled: !settings.soundEnabled });
    soundManager.setEnabled(!settings.soundEnabled);
  };

  return (
    <div className="top-bar fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-4 text-sm select-none">
      <div className="flex items-center gap-[2px]" ref={menuRef}>
        <img src="/icons/aymuos.png" alt="aymuOS" className="drag-none h-4" draggable="false" />
        {/* Menus */}
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              className={`menu-item ${openMenu === menu.label ? 'active bg-muted/50' : ''}`}
              onClick={() => handleMenuClick(menu.label)}
            >
              {menu.label}
            </button>

            <AnimatePresence>
              {openMenu === menu.label && menu.items.length > 0 && (
                <motion.div
                  className="absolute top-full left-0 mt-1 glass-panel py-1 min-w-48 z-50"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {menu.items.map((item, idx) => (
                    item.divider ? (
                      <div key={idx} className="border-t border-border my-1" />
                    ) : (
                      <button
                        key={idx}
                        className="w-full px-4 py-1.5 text-left text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground flex items-center justify-between"
                        onClick={() => {
                          item.action?.();
                          setOpenMenu(null);
                        }}
                        disabled={item.disabled}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-muted-foreground text-xs ml-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Center - Focused App Name */}
      <div className="absolute left-1/2 -translate-x-1/2 text-muted-foreground">
        {focusedWindow?.title}
      </div>

      {/* Right - System Tray */}
      <div className="flex items-center gap-3">
        {/* Volume */}
        <div className="relative">
          <button 
            className="p-1 hover:bg-muted/30 rounded transition-colors"
            onClick={toggleSound}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-foreground" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* WiFi */}
        <button className="p-1 hover:bg-muted/30 rounded transition-colors">
          <Wifi className="w-4 h-4 text-foreground" />
        </button>

        {/* Battery */}
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4 text-foreground" />
          <span className="text-xs text-muted-foreground">100%</span>
        </div>

        {/* Time */}
        <span className="text-foreground">{formattedTime}</span>
      </div>
    </div>
  );
}
