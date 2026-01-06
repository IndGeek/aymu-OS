import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Monitor,
  FileText,
  Download,
  Image,
  Music,
  HardDrive,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Search,
  FolderOpen,
  Edit3,
  Info,
  X,
} from 'lucide-react';
import { OsIcons } from '@/icons/os-icon';
import { TechIcons } from '@/icons/tech-icon';
import { useFileStore } from '@/stores/fileStore';
import { useWindowStore } from '@/stores/windowStore';
import type { FileSystemNode } from '@/types/os';

interface FinderAppProps {
  windowId: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  file: FileSystemNode | null;
}

const sidebarItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, path: '/home/Desktop' },
  { id: 'documents', label: 'Documents', icon: FileText, path: '/home/Documents' },
  { id: 'downloads', label: 'Downloads', icon: Download, path: '/home/Downloads' },
  { id: 'pictures', label: 'Pictures', icon: Image, path: '/home/Pictures' },
  { id: 'music', label: 'Music', icon: Music, path: '/home/Music' },
];

const systemFolders = [
  { id: 'root', label: '/', icon: HardDrive, path: '/' },
  { id: 'usr', label: '/usr', icon: OsIcons.Folder, path: '/usr' },
  { id: 'etc', label: '/etc', icon: Settings, path: '/etc' },
];

export function FinderApp({ windowId }: FinderAppProps) {
  const [currentPath, setCurrentPath] = useState('/home');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>(['/home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });
  const [renameDialog, setRenameDialog] = useState<{ visible: boolean; fileId: string; currentName: string }>({
    visible: false,
    fileId: '',
    currentName: '',
  });
  const [aboutDialog, setAboutDialog] = useState<{ visible: boolean; file: FileSystemNode | null }>({
    visible: false,
    file: null,
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const getChildren = useFileStore((state) => state.getChildren);
  const deleteNode = useFileStore((state) => state.deleteNode);
  const renameNode = useFileStore((state) => state.renameNode);
  const openWindow = useWindowStore((state) => state.openWindow);
  const files = getChildren(currentPath);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, file: null });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };

  const handleItemDoubleClick = (item: FileSystemNode) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else if (item.type === 'file') {
      const lower = item.name.toLowerCase();

      // Handle music files
      const isMusicFile = lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a');

      if (isMusicFile) {
        // Open music player with this song
        // Pass the file ID as metadata so the music player knows which song to play
        openWindow('music', item.name, { width: 620, height: 400 }, item.id);
        return;
      }

      const isTextLike =
        lower.endsWith('.txt') ||
        lower.endsWith('.md') ||
        lower.endsWith('.markdown') ||
        lower.endsWith('.js') ||
        lower.endsWith('.ts') ||
        lower.endsWith('.tsx') ||
        lower.endsWith('.json') ||
        lower.endsWith('.css') ||
        lower.endsWith('.html') ||
        lower.endsWith('.htm') ||
        lower.endsWith('.py') ||
        lower.endsWith('.sh');

      if (isTextLike) {
        openWindow('notepad', item.name, undefined, item.id);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();

    // Menu dimensions (approximate)
    const menuWidth = 200;
    const menuHeight = 250;

    // Calculate position, ensuring menu stays within viewport
    let x = e.clientX;
    let y = e.clientY;

    // Adjust horizontal position if menu would go off-screen to the right
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }

    // Adjust vertical position if menu would go off-screen to the bottom
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    // Ensure minimum margins from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setContextMenu({
      visible: true,
      x: x - 190,
      y: y - 100,
      file,
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.file) return;

    switch (action) {
      case 'open':
        handleItemDoubleClick(contextMenu.file);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${contextMenu.file.name}"?`)) {
          deleteNode(contextMenu.file.id);
        }
        break;
      case 'rename':
        setRenameDialog({
          visible: true,
          fileId: contextMenu.file.id,
          currentName: contextMenu.file.name,
        });
        break;
      case 'download':
        handleDownload(contextMenu.file);
        break;
      case 'about':
        setAboutDialog({
          visible: true,
          file: contextMenu.file,
        });
        break;
    }

    setContextMenu({ visible: false, x: 0, y: 0, file: null });
  };

  const handleDownload = (file: FileSystemNode) => {
    if (file.type === 'file' && file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== renameDialog.currentName) {
      renameNode(renameDialog.fileId, newName);
    }
    setRenameDialog({ visible: false, fileId: '', currentName: '' });
  };


  const getFileIcon = (file: FileSystemNode) => {
    if (file.type === 'folder') {
      return <OsIcons.Folder className="w-full h-full" />;
    }

    const lower = file.name.toLowerCase();

    // Music files
    if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a')) {
      return <Music className="w-full h-full text-primary" />;
    }

    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      return <TechIcons.MarkDown className="w-full h-full" />;
    }

    if (lower.endsWith('.js') || lower.endsWith('.jsx')) {
      return <TechIcons.JavaScript className="w-full h-full" />;
    }

    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
      return <TechIcons.TypeScript className="w-full h-full" />;
    }

    if (lower.endsWith('.py')) {
      return <TechIcons.Python className="w-full h-full" />;
    }

    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      return <TechIcons.HTML className="w-full h-full" />;
    }

    if (lower.endsWith('.css')) {
      return <TechIcons.CSS className="w-full h-full" />;
    }

    if (lower.endsWith('.json')) {
      return <TechIcons.JSON className="w-full h-full" />;
    }

    // Fallback: generic file icon
    return <FileText className="w-full h-full text-muted-foreground" />;
  };

  const getPathSegments = () => {
    const segments = currentPath.split('/').filter(Boolean);
    return segments.map((seg, idx) => ({
      name: seg,
      path: '/' + segments.slice(0, idx + 1).join('/'),
    }));
  };

  return (
    <div className="h-full flex text-sm">
      {/* Sidebar */}
      <div className="w-48 border-r border-white/5 p-3 flex flex-col gap-4 shrink-0" style={{ background: 'rgba(20, 20, 20, 0.6)' }}>
        {/* Favorites */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Favourites</p>
          <div className="flex flex-col gap-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${currentPath === item.path
                  ? 'bg-muted text-primary-background'
                  : 'text-foreground/80 hover:bg-muted/50'
                  }`}
                onClick={() => navigateTo(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2 px-2">System</p>
          <div className="flex flex-col gap-0.5">
            {systemFolders.map((item) => (
              <button
                key={item.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${currentPath === item.path
                  ? 'bg-muted text-primary-background'
                  : 'text-foreground/80 hover:bg-muted/50'
                  }`}
                onClick={() => navigateTo(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2 px-2">Locations</p>
          <div className="flex flex-col gap-0.5">
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md text-foreground hover:bg-muted/50">
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-border/50 flex items-center gap-2 px-3">
          {/* Navigation */}
          <button
            className="p-1.5 hover:bg-muted/50 rounded disabled:opacity-30"
            onClick={goBack}
            disabled={historyIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 hover:bg-muted/50 rounded disabled:opacity-30"
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 ml-2">
            {getPathSegments().map((seg, idx) => (
              <div key={seg.path} className="flex items-center">
                {idx > 0 && <span className="text-muted-foreground mx-1">/</span>}
                <button
                  className={`px-2 py-1 rounded ${currentPath === seg.path
                    ? 'bg-muted-foreground/20 text-white'
                    : 'hover:bg-muted/50'
                    }`}
                  onClick={() => navigateTo(seg.path)}
                >
                  {seg.name}
                </button>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <button
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="os-input pl-8 py-1 w-32"
            />
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 p-4 overflow-auto">
          {files.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              This folder is empty
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-6 gap-4">
              {files.map((file) => (
                <button
                  key={file.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  onDoubleClick={() => handleItemDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div className="w-12 h-12 text-primary flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                  <span className="text-xs text-center truncate w-full">{file.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  onDoubleClick={() => handleItemDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <div className="w-5 h-5 text-primary flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                  <span className="flex-1 text-left">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {file.modifiedAt.toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] min-w-[200px] rounded-xl overflow-hidden shadow-2xl border border-white/10"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            background: 'rgba(20, 20, 30, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="py-2">
            <ContextMenuItem
              icon={<FolderOpen className="w-4 h-4" />}
              label="Open"
              onClick={() => handleContextMenuAction('open')}
            />
            <ContextMenuItem
              icon={<Edit3 className="w-4 h-4" />}
              label="Rename"
              onClick={() => handleContextMenuAction('rename')}
            />
            <ContextMenuItem
              icon={<Download className="w-4 h-4" />}
              label="Download"
              onClick={() => handleContextMenuAction('download')}
              disabled={contextMenu.file?.type === 'folder'}
            />
            <div className="h-px bg-white/10 my-1 mx-2" />
            <ContextMenuItem
              icon={<Info className="w-4 h-4" />}
              label="About"
              onClick={() => handleContextMenuAction('about')}
            />
            <ContextMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              onClick={() => handleContextMenuAction('delete')}
              danger
            />
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {renameDialog.visible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rename</h3>
                <button
                  onClick={() => setRenameDialog({ visible: false, fileId: '', currentName: '' })}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newName = formData.get('name') as string;
                  handleRename(newName);
                }}
              >
                <input
                  type="text"
                  name="name"
                  defaultValue={renameDialog.currentName}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setRenameDialog({ visible: false, fileId: '', currentName: '' })}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors font-medium"
                  >
                    Rename
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* About Dialog */}
      {aboutDialog.visible && aboutDialog.file && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">About</h3>
                <button
                  onClick={() => setAboutDialog({ visible: false, file: null })}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 text-primary flex items-center justify-center">
                    {getFileIcon(aboutDialog.file)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{aboutDialog.file.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{aboutDialog.file.type}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <InfoRow label="Path" value={aboutDialog.file.path} />
                  <InfoRow label="Created" value={new Date(aboutDialog.file.createdAt).toLocaleDateString("en-In", { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <InfoRow label="Modified" value={new Date(aboutDialog.file.modifiedAt).toLocaleDateString("en-In", { day: 'numeric', month: 'long', year: 'numeric' })} />
                  {aboutDialog.file.type === 'file' && aboutDialog.file.content && (
                    <InfoRow label="Size" value={`${aboutDialog.file.content.length} bytes`} />
                  )}
                </div>
              </div>
              <button
                onClick={() => setAboutDialog({ visible: false, file: null })}
                className="w-full mt-6 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Context Menu Item Component
function ContextMenuItem({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${disabled
        ? 'opacity-40 cursor-not-allowed'
        : danger
          ? 'hover:bg-red-500/20 text-red-400'
          : 'hover:bg-white/10'
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate ml-4 max-w-[250px]" title={value}>
        {value}
      </span>
    </div>
  );
}

