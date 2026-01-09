import { AnimatePresence } from 'framer-motion';
import { useWindowStore } from '@/stores/windowStore';
import { Window } from './Window';
import { FinderApp } from '../apps/FinderApp';
import { TerminalApp } from '../apps/TerminalApp';
import { SettingsApp } from '../apps/SettingsApp';
import { AppStoreApp } from '../apps/AppStoreApp';
import { NotepadApp } from '../apps/NotepadApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { AboutApp } from '../apps/AboutApp';
import { MonitorApp } from '../apps/MonitorApp';
import { DeveloperSettingsApp } from '../apps/DeveloperSettingsApp';
import { MusicPlayerApp } from '../apps/MusicPlayerApp';
import { BrowserApp } from '../apps/BrowserApp';
import { PhotopeaApp } from '../apps/PhotopeaApp';
import { ExcalidrawApp } from '../apps/ExcalidrawApp';

const appComponents: Record<string, React.ComponentType<{ windowId: string; fileId?: string }>> = {
  finder: FinderApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  appstore: AppStoreApp,
  notepad: NotepadApp,
  calculator: CalculatorApp,
  about: AboutApp,
  monitor: MonitorApp,
  devsettings: DeveloperSettingsApp,
  music: MusicPlayerApp,
  browser: BrowserApp,
  photopea: PhotopeaApp,
  excalidraw: ExcalidrawApp,
};

export function WindowManager() {
  const windows = useWindowStore((state) => state.windows);

  return (
    <div className="absolute inset-0 pl-16 pt-2">
      <AnimatePresence mode="popLayout">
        {windows.map((windowState) => {
          const AppComponent = appComponents[windowState.appId];

          if (!AppComponent) {
            return (
              <Window key={windowState.id} windowState={windowState}>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  App not found: {windowState.appId}
                </div>
              </Window>
            );
          }

          return (
            <Window key={windowState.id} windowState={windowState}>
              <AppComponent windowId={windowState.id} fileId={windowState.fileId} />
            </Window>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
