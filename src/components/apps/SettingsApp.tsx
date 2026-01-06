import { useState } from 'react';
import {
  Palette,
  Activity,
  Monitor,
  Bell,
  Wifi,
  Shield,
  Users,
  HardDrive,
  Info,
  Check,
  Code2,
} from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import type { WallpaperType } from '@/types/os';
import { Switch } from '@/components/ui/switch';

interface SettingsAppProps {
  windowId: string;
}

const sections = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'performance', label: 'Performance', icon: Activity },
  { id: 'displays', label: 'Displays', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
  { id: 'users', label: 'Users & Groups', icon: Users },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'about', label: 'About', icon: Info },
];

const wallpapers: { id: WallpaperType; label: string; preview: string }[] = [
  { id: 'mountain', label: 'Mountain', preview: '/wallpapers/mountain.jpg' },
  { id: 'cosmos', label: 'Cosmos', preview: '/wallpapers/cosmos.jpg' },
  { id: 'voyage', label: 'Voyage', preview: '/wallpapers/voyage.jpg' },
];

const accentColors = [
  { id: 'indigo', color: 'bg-indigo-500' },
  { id: 'cyan', color: 'bg-cyan-500' },
  { id: 'orange', color: 'bg-orange-500' },
  { id: 'amber', color: 'bg-amber-500' },
  { id: 'emerald', color: 'bg-emerald-500' },
  { id: 'pink', color: 'bg-pink-500' },
  { id: 'purple', color: 'bg-purple-500' },
];

export function SettingsApp({ windowId }: SettingsAppProps) {
  const [activeSection, setActiveSection] = useState('appearance');
  const settings = useSystemStore((state) => state.settings);
  const updateSettings = useSystemStore((state) => state.updateSettings);
  const openWindow = useWindowStore((state) => state.openWindow);

  const openDevSettings = () => {
    openWindow('devsettings', 'DEV Center');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-light mb-6">Appearance</h2>

              {/* Wallpaper */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Desktop Wallpaper</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a background for your desktop environment
                </p>
                <div className="flex gap-4">
                  {wallpapers.map((wp) => (
                    <button
                      key={wp.id}
                      className={`relative w-28 h-20 rounded-lg overflow-hidden border-2 transition-all ${settings.wallpaper === wp.id
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                        }`}
                      onClick={() => updateSettings({ wallpaper: wp.id })}
                    >
                      <img
                        src={wp.preview}
                        alt={wp.label}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-foreground bg-background/50 px-2 rounded">
                        {settings.wallpaper === wp.id ? 'ACTIVE' : wp.label}
                      </span>
                      {settings.wallpaper === wp.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Accent Color</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose an accent color to personalize your desktop experience
                </p>
                <div className="flex gap-3">
                  {accentColors.map((accent) => (
                    <button
                      key={accent.id}
                      className={`w-16 h-16 rounded-lg ${accent.color} transition-transform hover:scale-105 ${settings.accentColor === accent.id
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground'
                          : ''
                        }`}
                      onClick={() => updateSettings({ accentColor: accent.id })}
                    >
                      {settings.accentColor === accent.id && (
                        <Check className="w-6 h-6 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Developer Mode */}
              <div>
                <h3 className="text-lg font-medium mb-2">Developer Mode</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable access to developer tools and debugging features
                </p>
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-primary" />
                    <span className="text-sm">Developer Settings</span>
                  </div>
                  <Switch
                    checked={settings.developerMode || false}
                    onCheckedChange={(checked) => updateSettings({ developerMode: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light">About This System</h2>

            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center">
                  <img src="/icons/aymuos.png" alt="AymuOS" className="w-16 h-16 object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">AymuOS</h3>
                  <p className="text-muted-foreground">Version 0.1.0</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">System</span>
                  <span>AymuOS v0.1.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Kernel</span>
                  <span>Browser Runtime</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Desktop</span>
                  <span>AymuDE 1.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Display Server</span>
                  <span>AymuWM (Wayland-inspired)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Memory used</span>
                  <span>{(performance as any).memory?.usedJSHeapSize
                    ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB`
                    : 'N/A'}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Made with ❤️ in India • Built with React & TypeScript
            </p>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">Coming Soon</p>
              <p className="text-sm">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/5 p-3" style={{ background: 'rgba(20, 20, 20, 0.6)' }}>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 px-2">System</p>
          <div className="flex flex-col gap-0.5">
            {sections.slice(0, 8).map((section) => (
              <button
                key={section.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                    ? 'bg-muted/50 text-foreground'
                    : 'text-foreground hover:bg-muted/50'
                  }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-white' : ''}`} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground font-medium mb-2 px-2">General</p>
          <div className="flex flex-col gap-0.5">
            {sections.slice(8).map((section) => (
              <button
                key={section.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                    ? 'bg-muted/50 text-foreground'
                    : 'text-foreground hover:bg-muted/50'
                  }`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-white' : ''}`} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Developer Settings - only show when enabled */}
        {settings.developerMode && (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Developer</p>
            <div className="flex flex-col gap-0.5">
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-foreground hover:bg-muted/50"
                onClick={openDevSettings}
              >
                <Code2 className="w-4 h-4" />
                <span className="text-sm">Developer Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
