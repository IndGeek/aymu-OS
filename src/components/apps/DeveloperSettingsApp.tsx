import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Palette,
  HardDrive,
  FolderTree,
  Terminal,
  Settings2,
  Gauge,
  Trash2,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  XCircle,
  Folder,
  FileText,
} from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';
import { useFileStore } from '@/stores/fileStore';
import type { DevFileSystemNode } from '@/types/os';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DeveloperSettingsAppProps {
  windowId: string;
}

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'General' },
  { id: 'ui', label: 'UI & Sounds', icon: Palette, group: 'Interface' },
  { id: 'storage', label: 'Storage', icon: HardDrive, group: 'System' },
  { id: 'filesystem', label: 'File System', icon: FolderTree, group: 'System' },
  { id: 'logs', label: 'System Logs', icon: Terminal, group: 'System' },
  { id: 'editor', label: 'Editor', icon: Settings2, group: 'Tools' },
  { id: 'performance', label: 'Performance', icon: Gauge, group: 'Tools' },
];

// Build file system with permissions
const buildDevFileSystem = (files: any[]): DevFileSystemNode => {
  const root: DevFileSystemNode = {
    id: crypto.randomUUID(),
    name: '/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    children: [],
  };

  // Create bin directory with commands
  const binDir: DevFileSystemNode = {
    id: crypto.randomUUID(),
    name: 'bin',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    children: [
      { id: crypto.randomUUID(), name: 'ls', type: 'file', content: '#!/bin/bash\n#command ls\n# list directory contents', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'cat', type: 'file', content: '#!/bin/bash\n#command cat\n# concatenate files', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'cd', type: 'file', content: '#!/bin/bash\n#command cd\n# change directory', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'pwd', type: 'file', content: '#!/bin/bash\n#command pwd\n# print working directory', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'mkdir', type: 'file', content: '#!/bin/bash\n#command mkdir\n# make directories', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'rm', type: 'file', content: '#!/bin/bash\n#command rm\n# remove files or directories', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'cp', type: 'file', content: '#!/bin/bash\n#command cp\n# copy files', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'mv', type: 'file', content: '#!/bin/bash\n#command mv\n# move files', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'touch', type: 'file', content: '#!/bin/bash\n#command touch\n# create empty file', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'echo', type: 'file', content: '#!/bin/bash\n#command echo\n# display a line of text', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'clear', type: 'file', content: '#!/bin/bash\n#command clear\n# clear terminal screen', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'whoami', type: 'file', content: '#!/bin/bash\n#command whoami\n# print effective userid', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'chmod', type: 'file', content: '#!/bin/bash\n#command chmod\n# change permissions', permissions: '-rwxr-xr-x', owner: 'root' },
      { id: crypto.randomUUID(), name: 'sudo', type: 'file', content: '#!/bin/bash\n#command sudo\n# execute as superuser', permissions: '-rwsr-xr-x', owner: 'root' },
    ],
  };

  // Create boot directory
  const bootDir: DevFileSystemNode = {
    id: crypto.randomUUID(),
    name: 'boot',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    children: [
      { id: crypto.randomUUID(), name: 'kernel', type: 'file', content: 'Aymu OS Kernel 0.1.0', permissions: '-rw-r--r--', owner: 'root' },
      { id: crypto.randomUUID(), name: 'initrd', type: 'file', content: 'Initial ramdisk', permissions: '-rw-r--r--', owner: 'root' },
    ],
  };

  // Create etc directory
  const etcDir: DevFileSystemNode = {
    id: crypto.randomUUID(),
    name: 'etc',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    children: [
      { id: crypto.randomUUID(), name: 'passwd', type: 'file', content: 'root:admin:0:0:System Administrator:/root:/bin/bash\nuser:1234:1000:1000:User:/home/user:/bin/bash', permissions: '-rw-r--r--', owner: 'root' },
      { id: crypto.randomUUID(), name: 'hostname', type: 'file', content: 'Aymu', permissions: '-rw-r--r--', owner: 'root' },
      { id: crypto.randomUUID(), name: 'os-release', type: 'file', content: 'NAME="Aymu OS"\nVERSION="0.1.0"\nID=aymu-os\nPRETTY_NAME="Aymu OS"', permissions: '-rw-r--r--', owner: 'root' },
    ],
  };

  // Build home from actual file store
  const homeDir: DevFileSystemNode = {
    id: crypto.randomUUID(),
    name: 'home',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    children: [],
  };

  // Add user files from store
  const buildFromStore = (parentId: string | null, parentNode: DevFileSystemNode) => {
    const children = files.filter(f => f.parentId === parentId);
    children.forEach(child => {
      const node: DevFileSystemNode = {
        id: child.id,
        name: child.name,
        type: child.type === 'folder' ? 'directory' : 'file',
        permissions: child.type === 'folder' ? 'drwxr-xr-x' : '-rw-r--r--',
        owner: 'user',
        content: child.content,
        children: child.type === 'folder' ? [] : undefined,
      };
      parentNode.children?.push(node);
      if (child.type === 'folder') {
        buildFromStore(child.id, node);
      }
    });
  };

  // Build from root level items in file store
  const homeFiles = files.filter(f => f.parentId === 'home' || f.id === 'home');
  homeFiles.forEach(f => {
    if (f.id !== 'home') {
      const node: DevFileSystemNode = {
        id: f.id,
        name: f.name,
        type: f.type === 'folder' ? 'directory' : 'file',
        permissions: f.type === 'folder' ? 'drwxr-x---' : '-rw-r--r--',
        owner: 'user',
        content: f.content,
        children: f.type === 'folder' ? [] : undefined,
      };
      homeDir.children?.push(node);
      if (f.type === 'folder') {
        buildFromStore(f.id, node);
      }
    }
  });

  root.children = [binDir, bootDir, etcDir, homeDir];
  return root;
};

function FileTreeNode({ node, depth = 0 }: { node: DevFileSystemNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = node.type === 'directory';

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer text-sm font-mono"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDir && setExpanded(!expanded)}
      >
        {isDir ? (
          expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <span className="w-3" />
        )}
        {isDir ? (
          <Folder className="w-4 h-4 text-cyan-400" />
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={isDir ? 'text-cyan-400' : 'text-foreground'}>{node.name}</span>
        <span className="text-muted-foreground text-xs ml-auto">{node.permissions}</span>
        <span className="text-muted-foreground text-xs w-12 text-right">{node.owner}</span>
      </div>
      {isDir && expanded && node.children?.map((child) => (
        <FileTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function LocalStorageItem({ keyName, onDelete }: { keyName: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const value = localStorage.getItem(keyName) || '';
  const size = new Blob([value]).size;

  return (
    <div className="border-b border-white/5">
      <div
        className="flex items-center gap-3 py-3 px-4 hover:bg-white/5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <span className="text-sm font-mono flex-1">{keyName}</span>
        <span className="text-xs text-muted-foreground">{size} B</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-3">
          <pre className="text-xs text-muted-foreground bg-black/30 p-3 rounded overflow-x-auto max-h-40">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(value), null, 2);
              } catch {
                return value;
              }
            })()}
          </pre>
        </div>
      )}
    </div>
  );
}

export function DeveloperSettingsApp({ windowId }: DeveloperSettingsAppProps) {
  const [activeSection, setActiveSection] = useState('storage');
  const [localStorageKeys, setLocalStorageKeys] = useState<string[]>([]);
  const settings = useSystemStore((state) => state.settings);
  const files = useFileStore((state) => state.files);

  useEffect(() => {
    const keys = Object.keys(localStorage);
    setLocalStorageKeys(keys);
  }, [activeSection]);

  const refreshLocalStorage = () => {
    setLocalStorageKeys(Object.keys(localStorage));
  };

  const deleteKey = (key: string) => {
    localStorage.removeItem(key);
    refreshLocalStorage();
  };

  const clearAllStorage = () => {
    localStorage.clear();
    refreshLocalStorage();
  };

  const exportStorage = () => {
    const data: Record<string, string> = {};
    localStorageKeys.forEach(key => {
      data[key] = localStorage.getItem(key) || '';
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aymu-os-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importStorage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            Object.entries(data).forEach(([key, value]) => {
              localStorage.setItem(key, value as string);
            });
            refreshLocalStorage();
          } catch (err) {
            console.error('Failed to import storage:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getTotalSize = () => {
    let total = 0;
    localStorageKeys.forEach(key => {
      const value = localStorage.getItem(key) || '';
      total += new Blob([value]).size;
    });
    return total;
  };

  const getFileSystemSize = () => {
    return new Blob([JSON.stringify(files)]).size;
  };

  const devFileSystem = buildDevFileSystem(files);

  const renderContent = () => {
    switch (activeSection) {
      case 'storage':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light">Storage Inspector</h2>
              <div className="flex gap-2">
                <button
                  onClick={importStorage}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={exportStorage}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={clearAllStorage}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-1">Soft Memory (Preferences)</p>
                <p className="text-3xl font-light">{(getTotalSize() / 1024).toFixed(1)} <span className="text-lg">KB</span></p>
                <p className="text-xs text-muted-foreground mt-1">{localStorageKeys.length} keys</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-1">Hard Memory (Filesystem)</p>
                <p className="text-3xl font-light">{(getFileSystemSize() / 1024).toFixed(1)} <span className="text-lg">KB</span></p>
                <p className="text-xs text-muted-foreground mt-1">{files.length} nodes</p>
              </div>
            </div>

            {/* Keys list */}
            <div>
              <h3 className="text-lg font-medium mb-3">Local Storage Keys</h3>
              <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <ScrollArea className="h-[300px]">
                  {localStorageKeys.map(key => (
                    <LocalStorageItem
                      key={key}
                      keyName={key}
                      onDelete={() => deleteKey(key)}
                    />
                  ))}
                  {localStorageKeys.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No localStorage keys found
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        );

      case 'filesystem':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light">File System Debugger</h2>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(devFileSystem, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'aymu-filesystem.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>

            {/* File tree */}
            <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
              <div className="flex items-center gap-4 p-3 border-b border-white/5 text-xs text-muted-foreground font-mono">
                <span className="flex-1">Name</span>
                <span className="w-24">Permissions</span>
                <span className="w-12 text-right">Owner</span>
              </div>
              <ScrollArea className="h-[350px]">
                <FileTreeNode node={devFileSystem} />
              </ScrollArea>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light">Developer Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-2">System Version</p>
                <p className="text-xl font-medium">AymuOS 0.1.0</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-2">React Version</p>
                <p className="text-xl font-medium">18.3.1</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-2">Current Wallpaper</p>
                <p className="text-xl font-medium capitalize">{settings.wallpaper}</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                <p className="text-sm text-muted-foreground mb-2">Accent Color</p>
                <p className="text-xl font-medium capitalize">{settings.accentColor}</p>
              </div>
            </div>
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

  const groupedSections = sections.reduce((acc, section) => {
    if (!acc[section.group]) acc[section.group] = [];
    acc[section.group].push(section);
    return acc;
  }, {} as Record<string, typeof sections>);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-48 border-r border-white/5 p-3" style={{ background: 'rgba(20, 20, 20, 0.6)' }}>
        {Object.entries(groupedSections).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="text-xs text-muted-foreground font-medium mb-2 px-2">{group}</p>
            <div className="flex flex-col gap-0.5">
              {items.map((section) => (
                <button
                  key={section.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-foreground hover:bg-muted/50'
                    }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="text-sm">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}