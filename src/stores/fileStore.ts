import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileSystemNode } from '@/types/os';

interface FileStore {
  files: FileSystemNode[];

  // File Operations
  createFile: (parentPath: string, name: string, content?: string) => FileSystemNode;
  createFolder: (parentPath: string, name: string) => FileSystemNode;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  moveNode: (id: string, newParentPath: string) => void;

  // Getters
  getNodeById: (id: string) => FileSystemNode | undefined;
  getNodeByPath: (path: string) => FileSystemNode | undefined;
  getChildren: (parentPath: string) => FileSystemNode[];
  getPath: (id: string) => string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultFileSystem: FileSystemNode[] = [
  // Root folders
  { id: 'home', name: 'home', type: 'folder', path: '/home', parentId: null, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'usr', name: 'usr', type: 'folder', path: '/usr', parentId: null, createdAt: new Date(), modifiedAt: new Date() },
  { id: 'etc', name: 'etc', type: 'folder', path: '/etc', parentId: null, createdAt: new Date(), modifiedAt: new Date() },

  // User folders
  { id: 'desktop', name: 'Desktop', type: 'folder', path: '/home/Desktop', parentId: 'home', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'documents', name: 'Documents', type: 'folder', path: '/home/Documents', parentId: 'home', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'downloads', name: 'Downloads', type: 'folder', path: '/home/Downloads', parentId: 'home', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'pictures', name: 'Pictures', type: 'folder', path: '/home/Pictures', parentId: 'home', createdAt: new Date(), modifiedAt: new Date() },
  { id: 'music', name: 'Music', type: 'folder', path: '/home/Music', parentId: 'home', createdAt: new Date(), modifiedAt: new Date() },

  // Music files
  {
    id: 'music-1',
    name: 'In The Glow of Our Love - SFoura (Official Music).mp3',
    type: 'file',
    path: '/home/Music/In The Glow of Our Love - SFoura (Official Music).mp3',
    parentId: 'music',
    content: '/musics/In The Glow of Our Love - SFoura (Official Music).mp3', // Store the public path in content
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'music-2',
    name: 'Unstoppable.mp3',
    type: 'file',
    path: '/home/Music/Unstoppable.mp3',
    parentId: 'music',
    content: '/musics/Unstoppable.mp3', // Store the public path in content
    createdAt: new Date(),
    modifiedAt: new Date()
  },

  // Sample files
  {
    id: 'readme',
    name: 'README.txt',
    type: 'file',
    path: '/home/Desktop/README.txt',
    parentId: 'desktop',
    content: 'Welcome to AymuOS!\n\nThis is your personal desktop operating system running entirely in your browser.\n\nExplore the apps, customize your settings, and enjoy!',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'recipe',
    name: 'recipe.md',
    type: 'file',
    path: '/home/recipe.md',
    parentId: 'home',
    content: '# Recipe to the biriyani is given below\n- step 1, download zomato\n- step 2, order biriyani',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'osrelease',
    name: 'os-release',
    type: 'file',
    path: '/etc/os-release',
    parentId: 'etc',
    content: 'NAME="AymuOS"\nVERSION="0.1.0"\nID=aymu-os\nPRETTY_NAME="AymuOS"',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
];

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: defaultFileSystem,

      createFile: (parentPath, name, content = '') => {
        const id = generateId();
        const path = `${parentPath}/${name}`;
        const parentNode = get().getNodeByPath(parentPath);

        const newFile: FileSystemNode = {
          id,
          name,
          type: 'file',
          path,
          parentId: parentNode?.id || null,
          content,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        set((state) => ({
          files: [...state.files, newFile],
        }));

        return newFile;
      },

      createFolder: (parentPath, name) => {
        const id = generateId();
        const path = `${parentPath}/${name}`;
        const parentNode = get().getNodeByPath(parentPath);

        const newFolder: FileSystemNode = {
          id,
          name,
          type: 'folder',
          path,
          parentId: parentNode?.id || null,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };

        set((state) => ({
          files: [...state.files, newFolder],
        }));

        return newFolder;
      },

      deleteNode: (id) => {
        const node = get().getNodeById(id);
        if (!node) return;

        // Get all descendant IDs
        const getDescendantIds = (nodeId: string): string[] => {
          const children = get().files.filter(f => f.parentId === nodeId);
          return [nodeId, ...children.flatMap(c => getDescendantIds(c.id))];
        };

        const idsToDelete = getDescendantIds(id);

        set((state) => ({
          files: state.files.filter(f => !idsToDelete.includes(f.id)),
        }));
      },

      renameNode: (id, newName) => {
        set((state) => ({
          files: state.files.map(f =>
            f.id === id
              ? {
                ...f,
                name: newName,
                path: f.path.replace(/\/[^/]+$/, `/${newName}`),
                modifiedAt: new Date(),
              }
              : f
          ),
        }));
      },

      updateFileContent: (id, content) => {
        set((state) => ({
          files: state.files.map(f =>
            f.id === id
              ? { ...f, content, modifiedAt: new Date() }
              : f
          ),
        }));
      },

      moveNode: (id, newParentPath) => {
        const node = get().getNodeById(id);
        const newParent = get().getNodeByPath(newParentPath);
        if (!node) return;

        set((state) => ({
          files: state.files.map(f =>
            f.id === id
              ? {
                ...f,
                parentId: newParent?.id || null,
                path: `${newParentPath}/${f.name}`,
                modifiedAt: new Date(),
              }
              : f
          ),
        }));
      },

      getNodeById: (id) => get().files.find(f => f.id === id),

      getNodeByPath: (path) => get().files.find(f => f.path === path),

      getChildren: (parentPath) => {
        const parent = get().getNodeByPath(parentPath);
        if (!parent) {
          // Root level
          return get().files.filter(f => f.parentId === null);
        }
        return get().files.filter(f => f.parentId === parent.id);
      },

      getPath: (id) => {
        const node = get().getNodeById(id);
        return node?.path || '/';
      },
    }),
    {
      name: 'aymu-os-files',
    }
  )
);
