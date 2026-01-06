import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWindowStore } from '@/stores/windowStore';
import { soundManager } from '@/lib/sounds';

export function Dock() {
  const getDockApps = useAppStore((state) => state.getDockApps);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const windows = useWindowStore((state) => state.windows);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const dockApps = getDockApps();

  const handleAppClick = (appId: string, appName: string) => {
    soundManager.playTick();

    // Check if there's already an open window for this app
    const existingWindow = windows.find(w => w.appId === appId);

    if (existingWindow) {
      // If window is minimized, restore and focus it
      if (existingWindow.isMinimized) {
        focusWindow(existingWindow.id);
      } else {
        // Bring existing window to front
        focusWindow(existingWindow.id);
      }
    } else {
      // Open new window if none exists
      // Custom sizes for specific apps
      const customSizes: Record<string, { width: number; height: number }> = {
        music: { width: 620, height: 400 },
        browser: { width: 1024, height: 700 },
      };

      const initialSize = customSizes[appId];
      openWindow(appId, appName, initialSize);
    }
  };

  const isAppRunning = (appId: string) => {
    return windows.some(w => w.appId === appId && !w.isMinimized);
  };

  return (
    <motion.div
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
    >
      <div className="dock flex flex-col gap-1 -translate-y-1/2">
        {dockApps.map((app, index) => (
          <div
            key={app.id}
            className="relative"
            onMouseEnter={() => setHoveredApp(app.id)}
            onMouseLeave={() => setHoveredApp(null)}
          >
            <motion.button
              className={`dock-item ${isAppRunning(app.id) ? 'active' : ''}`}
              onClick={() => handleAppClick(app.id, app.name)}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{
                scale: 1.13,
                x: 20,
                transition: {
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }
              }}
              exit={{
                scale: 1,
                y: 0,
                x: 0,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`app-icon ${app.iconBg}`}>
                <app.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </motion.button>

            <AnimatePresence>
              {hoveredApp === app.id && (
                <motion.div
                  className="absolute left-full ml-3 px-2 py-1 bg-[hsl(var(--glass-bg))] backdrop-blur-xl border border-[hsl(var(--glass-border))] rounded-lg text-xs text-foreground whitespace-nowrap z-50 pointer-events-none -translate-y-24"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {app.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="w-8 h-px bg-border/50 mx-auto my-1" />

        <div
          className="relative"
          onMouseEnter={() => setHoveredApp('trash')}
          onMouseLeave={() => setHoveredApp(null)}
        >
          <motion.button
            className="dock-item"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{
              scale: 1.2,
              y: -8,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="app-icon bg-gradient-to-br from-gray-600 to-gray-800">
              <Trash2 className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </motion.button>

          <AnimatePresence>
            {hoveredApp === 'trash' && (
              <motion.div
                className="absolute left-full ml-3 px-2 py-1 bg-[hsl(var(--glass-bg))] backdrop-blur-xl border border-[hsl(var(--glass-border))] rounded-lg text-xs text-foreground whitespace-nowrap z-50 pointer-events-none"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
              >
                Trash
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
