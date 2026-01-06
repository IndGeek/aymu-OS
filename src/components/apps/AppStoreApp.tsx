import { useState } from 'react';
import { Search, Download, Check, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { soundManager } from '@/lib/sounds';
import type { AppCategory } from '@/types/os';

interface AppStoreAppProps {
  windowId: string;
}

const categories: { id: AppCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'media', label: 'Media' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'development', label: 'Development' },
  { id: 'system', label: 'System' },
];

export function AppStoreApp({ windowId }: AppStoreAppProps) {
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingApps, setInstallingApps] = useState<Set<string>>(new Set());

  const apps = useAppStore((state) => state.apps);
  const installedAppIds = useAppStore((state) => state.installedAppIds);
  const installApp = useAppStore((state) => state.installApp);
  const uninstallApp = useAppStore((state) => state.uninstallApp);

  const filteredApps = apps.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = async (appId: string) => {
    soundManager.playTick();
    setInstallingApps((prev) => new Set(prev).add(appId));
    
    // Simulate installation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    installApp(appId);
    setInstallingApps((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      return next;
    });
  };

  const handleUninstall = (appId: string) => {
    soundManager.playTick();
    uninstallApp(appId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="os-input w-full pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const isInstalled = installedAppIds.includes(app.id);
            const isInstalling = installingApps.has(app.id);

            return (
              <div
                key={app.id}
                className="glass-panel p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* App Icon */}
                  <div className={`app-icon ${app.iconBg} shrink-0`}>
                    <app.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{app.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase">
                      {app.category}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {app.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  {app.isSystemApp ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="w-3 h-3" />
                      <span>System App</span>
                    </div>
                  ) : isInstalled ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors text-sm"
                        onClick={() => handleUninstall(app.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Uninstall</span>
                      </button>
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Check className="w-3 h-3" />
                        Installed
                      </span>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-2 os-button-primary disabled:opacity-50"
                      onClick={() => handleInstall(app.id)}
                      disabled={isInstalling}
                    >
                      {isInstalling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>Installing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No apps found
          </div>
        )}
      </div>
    </div>
  );
}
