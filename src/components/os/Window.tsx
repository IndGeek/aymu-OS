import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { useAppStore } from '@/stores/appStore';
import { soundManager } from '@/lib/sounds';
import type { WindowState } from '@/types/os';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

export function Window({ windowState, children }: WindowProps) {
  const { 
    id, 
    title, 
    x, 
    y, 
    width, 
    height, 
    isMinimized, 
    isMaximized, 
    isFocused, 
    zIndex,
    minWidth = 400,
    minHeight = 300,
  } = windowState;

  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const updateWindowPosition = useWindowStore((state) => state.updateWindowPosition);
  const updateWindowSize = useWindowStore((state) => state.updateWindowSize);
  const getDockApps = useAppStore((state) => state.getDockApps);

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    soundManager.playTick();
    focusWindow(id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  }, [id, x, y, isMaximized, focusWindow]);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
    const newY = Math.max(28, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50));
    updateWindowPosition(id, newX, newY);
  }, [isDragging, dragOffset, id, updateWindowPosition]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    });
  }, [id, width, height, isMaximized, focusWindow]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
    const newHeight = Math.max(minHeight, resizeStart.height + deltaY);
    updateWindowSize(id, newWidth, newHeight);
  }, [isResizing, resizeStart, id, minWidth, minHeight, updateWindowSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  const handleMaximize = () => {
    if (isMaximized) {
      restoreWindow(id);
    } else {
      maximizeWindow(id);
    }
  };

  // Calculate dock icon position for minimize animation
  const getDockIconPosition = useCallback(() => {
    const dockApps = getDockApps();
    const appIndex = dockApps.findIndex(app => app.id === windowState.appId);
    
    if (appIndex === -1) {
      // App not in dock, animate to center of dock
      return {
        x: 12 + 8 + 24, // left-3 + padding + half icon
        y: window.innerHeight / 2,
      };
    }
    
    // Dock is positioned at left-3 (12px), centered vertically
    const dockLeft = 12; // left-3 = 12px
    const dockTop = window.innerHeight / 2; // centered vertically
    const iconSize = 48; // w-12
    const iconGap = 4; // gap-1 = 4px
    const iconPadding = 8; // p-2 = 8px
    const iconTotalHeight = iconSize + iconGap; // height + gap
    
    // Calculate position: start from top and offset by index
    // Dock is centered, so we need to offset from center
    const totalDockHeight = dockApps.length * iconTotalHeight;
    const startY = dockTop - totalDockHeight / 2 + iconTotalHeight / 2;
    
    return {
      x: dockLeft + iconPadding + iconSize / 2,
      y: startY + appIndex * iconTotalHeight,
    };
  }, [windowState.appId, getDockApps]);

  const dockPosition = getDockIconPosition();

  return (
    <motion.div
      ref={windowRef}
      className={`absolute flex flex-col select-none rounded-xl overflow-hidden border border-gray-400/10 shadow-2xl ${
        isFocused ? 'ring-1 ring-neutral-400/30' : ''
      }`}
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex,
        pointerEvents: isMinimized ? 'none' : 'auto',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isMinimized ? {
        x: dockPosition.x - (x + width / 2),
        y: dockPosition.y - (y + height / 2),
        scale: 0.15,
        opacity: 0,
      } : {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      exit={{ 
        x: dockPosition.x - (x + width / 2),
        y: dockPosition.y - (y + height / 2),
        scale: 0.15,
        opacity: 0,
      }}
      transition={{ 
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
      }}
      onMouseDown={() => !isFocused && focusWindow(id)}
    >
      <div
        className="flex items-center h-7 px-3 backdrop-blur-xl border-b border-white/5 cursor-move shrink-0"
        style={{ background: 'rgba(23, 23, 23, 0.95)' }}
        onMouseDown={handleDragStart}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2 mr-4">
          <button
            className="traffic-light traffic-close group flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
          >
            <X className="w-2 h-2 opacity-0 group-hover:opacity-100 text-background" />
          </button>
          <button
            className="traffic-light traffic-minimize group flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(id);
            }}
          >
            <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 text-background" />
          </button>
          <button
            className="traffic-light traffic-maximize group flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleMaximize();
            }}
          >
            <Square className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 text-background" />
          </button>
        </div>

        <span className="flex-1 text-center text-sm text-muted-foreground truncate pointer-events-none">
          {title}
        </span>

        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-hidden backdrop-blur-xl" style={{ background: 'rgba(30, 30, 30, 0.80)' }}>
        {children}
      </div>

      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <svg
            className="absolute bottom-1 right-1 w-2 h-2 text-muted-foreground/50"
            viewBox="0 0 8 8"
          >
            <path d="M8 0v8H0" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M8 3v5H3" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
