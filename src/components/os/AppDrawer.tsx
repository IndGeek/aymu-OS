import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid3x3 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWindowStore } from '@/stores/windowStore';
import { soundManager } from '@/lib/sounds';

interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AppDrawer({ isOpen, onClose }: AppDrawerProps) {
    const getInstalledApps = useAppStore((state) => state.getInstalledApps);
    const openWindow = useWindowStore((state) => state.openWindow);
    const focusWindow = useWindowStore((state) => state.focusWindow);
    const windows = useWindowStore((state) => state.windows);

    const installedApps = getInstalledApps();

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
                excalidraw: { width: 1300, height: 720 },
            };

            const initialSize = customSizes[appId];
            openWindow(appId, appName, initialSize);
        }

        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed left-[17%] top-1/4 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-4xl max-h-[80vh] overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Glassmorphism Container */}
                        <div className="relative bg-primary-foreground/20 backdrop-blur-xl border border-neutral-400/20 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-300/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-indigo-300 via-indigo-700 to-indigo-700 rounded-lg">
                                        <Grid3x3 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-foreground">App Drawer</h2>
                                        <p className="text-sm text-muted-background/60">
                                            {installedApps.length} app{installedApps.length !== 1 ? 's' : ''} installed
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[hsl(var(--glass-border))] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-foreground" />
                                </button>
                            </div>

                            {/* App Grid */}
                            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
                                    {installedApps.map((app, index) => (
                                        <motion.button
                                            key={app.id}
                                            onClick={() => handleAppClick(app.id, app.name)}
                                            className="group relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {/* App Icon */}
                                            <div className={`w-16 h-16 rounded-[16px] ${app.iconBg} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                                <app.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                                            </div>

                                            {/* App Name */}
                                            <span className="text-sm font-medium text-foreground text-center line-clamp-2">
                                                {app.name}
                                            </span>

                                            {/* Hover Effect Glow */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-200 pointer-events-none" />
                                        </motion.button>
                                    ))}
                                </div>

                                {installedApps.length === 0 && (
                                    <div className="text-center py-12">
                                        <Grid3x3 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-muted-foreground">No apps installed</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
