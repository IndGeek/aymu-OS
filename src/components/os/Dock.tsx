import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Grid3x3, Pin, PinOff } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWindowStore } from '@/stores/windowStore';
import { soundManager } from '@/lib/sounds';
import { AppDrawer } from './AppDrawer';

interface ContextMenu {
  appId: string;
  x: number;
  y: number;
  isPinned: boolean;
  isRunning: boolean;
}

export function Dock() {
  const getDockApps = useAppStore((state) => state.getDockApps);
  const getApp = useAppStore((state) => state.getApp);
  const pinApp = useAppStore((state) => state.pinApp);
  const unpinApp = useAppStore((state) => state.unpinApp);
  const isPinned = useAppStore((state) => state.isPinned);

  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const windows = useWindowStore((state) => state.windows);

  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);

  const dockApps = getDockApps();

  // Get running apps that are not pinned
  const runningApps = windows
    .filter(w => !w.isMinimized)
    .map(w => w.appId)
    .filter((appId, index, self) => self.indexOf(appId) === index) // unique
    .filter(appId => !isPinned(appId))
    .map(appId => getApp(appId))
    .filter(Boolean);

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
      const customSizes: Record<string, { width: number; height: number }> = {
        music: { width: 620, height: 400 },
        browser: { width: 1024, height: 700 },
        photopea: { width: 1300, height: 750 },
        excalidraw: { width: 1300, height: 700 },
      };

      const initialSize = customSizes[appId];
      openWindow(appId, appName, initialSize);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    soundManager.playTick();

    const isRunning = windows.some(w => w.appId === appId && !w.isMinimized);
    const appIsPinned = isPinned(appId);

    setContextMenu({
      appId,
      x: e.clientX,
      y: e.clientY,
      isPinned: appIsPinned,
      isRunning,
    });
  };

  const handlePin = () => {
    if (contextMenu) {
      pinApp(contextMenu.appId);
      soundManager.playTick();
      setContextMenu(null);
    }
  };

  const handleUnpin = () => {
    if (contextMenu) {
      unpinApp(contextMenu.appId);
      soundManager.playTick();
      setContextMenu(null);
    }
  };

  const isAppRunning = (appId: string) => {
    return windows.some(w => w.appId === appId && !w.isMinimized);
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    if (contextMenu) {
      setContextMenu(null);
    }
  };

  return (
    <>
      {/* Click outside handler */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[45]"
          onClick={handleClickOutside}
          onContextMenu={(e) => {
            e.preventDefault();
            handleClickOutside();
          }}
        />
      )}

      <motion.div
        className="fixed left-3 top-1/2 -translate-y-1/2 z-40"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
      >
        <div className="dock flex flex-col -translate-y-1/2">
          {/* App Drawer Button */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredApp('app-drawer')}
            onMouseLeave={() => setHoveredApp(null)}
          >
            <motion.button
              className="dock-item"
              onClick={() => {
                soundManager.playTick();
                setIsAppDrawerOpen(true);
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{
                scale: 1.13,
                x: 20,
                transition: {
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="app-icon bg-gradient-to-br from-indigo-300 via-indigo-700 to-indigo-700">
                <Grid3x3 className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </motion.button>

            <AnimatePresence>
              {hoveredApp === 'app-drawer' && (
                <motion.div
                  className="absolute left-full ml-3 px-2 py-1 bg-[hsl(var(--glass-bg))] backdrop-blur-xl border border-[hsl(var(--glass-border))] rounded-lg text-xs text-foreground whitespace-nowrap z-50 pointer-events-none -translate-y-24"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  App Drawer
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-8 h-px bg-border/70 mx-auto my-1" />

          {/* Pinned Apps */}
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
                onContextMenu={(e) => handleContextMenu(e, app.id)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{
                  scale: 1.13,
                  x: 10,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 5,
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

          {/* Divider between pinned and running apps */}
          {runningApps.length > 0 && (
            <div className="w-8 h-px bg-border/70 mx-auto my-1" />
          )}

          {/* Running (unpinned) Apps */}
          {runningApps.map((app) => {
            if (!app) return null;
            return (
              <div
                key={`running-${app.id}`}
                className="relative"
                onMouseEnter={() => setHoveredApp(`running-${app.id}`)}
                onMouseLeave={() => setHoveredApp(null)}
              >
                <motion.button
                  className="dock-item active"
                  onClick={() => handleAppClick(app.id, app.name)}
                  onContextMenu={(e) => handleContextMenu(e, app.id)}
                  initial={{ x: -20, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -20, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{
                    scale: 1.13,
                    x: 20,
                    transition: {
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`app-icon ${app.iconBg}`}>
                    <app.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {hoveredApp === `running-${app.id}` && (
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
            );
          })}

          <div className="w-8 h-px bg-border/70 mx-auto my-1" />

          {/* Trash */}
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

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            className="fixed z-50 min-w-[180px] bg-[hsl(var(--glass-bg))] backdrop-blur-xl border border-[hsl(var(--glass-border))] rounded-lg shadow-2xl overflow-hidden"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {contextMenu.isPinned ? (
              <button
                onClick={handleUnpin}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-[hsl(var(--glass-border))] transition-colors flex items-center gap-2"
              >
                <PinOff className="w-4 h-4" />
                Unpin from Dock
              </button>
            ) : (
              <button
                onClick={handlePin}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-[hsl(var(--glass-border))] transition-colors flex items-center gap-2"
              >
                <Pin className="w-4 h-4" />
                Pin to Dock
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Drawer Modal */}
      <AppDrawer isOpen={isAppDrawerOpen} onClose={() => setIsAppDrawerOpen(false)} />
    </>
  );
}
