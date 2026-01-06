import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/stores/systemStore';
import { soundManager } from '@/lib/sounds';
import { useImagePreload } from '@/hooks/useImagePreload';
import type { BootLogEntry } from '@/types/os';

const WALLPAPER_URLS = [
  '/wallpapers/mountain.jpg',
  '/wallpapers/cosmos.jpg',
  '/wallpapers/voyage.jpg',
];

const bootLogs: BootLogEntry[] = [
  { text: '[    0.000000] AymuOS kernel 6.2.0 loading...', color: 'white', delay: 10 },
  { text: '[    0.012543] BIOS-provided memory map:', color: 'cyan', delay: 8 },
  { text: '[    0.024891] ACPI: RSDP 0x00000000000F0490', color: 'white', delay: 6 },
  { text: '[    0.036712] Detected 8192 MB RAM', color: 'green', delay: 10 },
  { text: '[    0.048234] CPU: 8 cores @ 3.2GHz', color: 'green', delay: 8 },
  { text: '[    0.059876] GPU: Integrated Graphics 4K', color: 'cyan', delay: 10 },
  { text: '[    0.071234] Initializing virtual memory subsystem...', color: 'white', delay: 12 },
  { text: '[    0.083456] Memory zones initialized', color: 'green', delay: 6 },
  { text: '[    0.095678] Security: AppArmor initialized', color: 'magenta', delay: 10 },
  { text: '[    0.107890] Mounting root filesystem...', color: 'white', delay: 15 },
  { text: '[    0.120123] EXT4-fs mounted on /', color: 'green', delay: 8 },
  { text: '[    0.132345] Starting systemd v254...', color: 'cyan', delay: 10 },
  { text: '[    0.144567] systemd: Detected architecture x86-64', color: 'white', delay: 6 },
  { text: '[    0.156789] Starting device manager...', color: 'white', delay: 8 },
  { text: '[    0.169012] udev: Starting version 254', color: 'cyan', delay: 10 },
  { text: '[    0.181234] Loading network drivers...', color: 'white', delay: 12 },
  { text: '[    0.193456] eth0: Link is up - 1000 Mbps', color: 'green', delay: 8 },
  { text: '[    0.205678] DHCP: Obtained lease 192.168.1.42', color: 'green', delay: 10 },
  { text: '[    0.217890] Starting display manager...', color: 'white', delay: 15 },
  { text: '[    0.230123] Wayland compositor initialized', color: 'cyan', delay: 10 },
  { text: '[    0.242345] Audio: PulseAudio starting...', color: 'white', delay: 8 },
  { text: '[    0.254567] Audio: Device initialized successfully', color: 'green', delay: 6 },
  { text: '[    0.266789] Starting AymuOS services...', color: 'magenta', delay: 12 },
  { text: '[    0.279012] Package manager initialized', color: 'green', delay: 8 },
  { text: '[    0.291234] System integrity check... PASSED', color: 'green', delay: 15 },
  { text: '[    0.303456] Network ping: 8ms latency', color: 'green', delay: 10 },
  { text: '', color: 'white', delay: 20 },
  { text: 'AymuOS terminal [v0.1.0]', color: 'cyan', delay: 15 },
  { text: 'System Ready.', color: 'green', delay: 20 },
];

export function BootScreen() {
  const [visibleLogs, setVisibleLogs] = useState<BootLogEntry[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const setSystemState = useSystemStore((state) => state.setSystemState);

  // Preload wallpapers during boot sequence
  useImagePreload(WALLPAPER_URLS);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const addNextLog = () => {
      if (currentIndex < bootLogs.length) {
        const log = bootLogs[currentIndex];
        setVisibleLogs((prev) => [...prev, log]);
        currentIndex++;
        timeoutId = setTimeout(addNextLog, log.delay);
      } else {
        setIsComplete(true);
        soundManager.playBootBeep();
        setTimeout(() => {
          setSystemState('login');
        }, 1000);
      }
    };

    // Start boot sequence
    timeoutId = setTimeout(addNextLog, 100);

    return () => clearTimeout(timeoutId);
  }, [setSystemState]);

  const getColorClass = (color: BootLogEntry['color']) => {
    switch (color) {
      case 'cyan': return 'terminal-cyan';
      case 'magenta': return 'terminal-magenta';
      case 'green': return 'terminal-green';
      case 'yellow': return 'terminal-yellow';
      case 'red': return 'terminal-red';
      default: return 'text-terminal-white';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full w-full p-6 overflow-hidden terminal">
        <div className="flex flex-col space-y-1">
          <AnimatePresence>
            {visibleLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className={`text-sm font-mono ${getColorClass(log.color)}`}
              >
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {!isComplete && (
            <motion.span
              className="inline-block w-2.5 h-5 bg-terminal-cyan animate-cursor-blink"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
