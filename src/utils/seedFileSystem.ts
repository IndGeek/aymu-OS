import type { FileSystemNode } from '@/types/os';
import fileSystemSeedManifest from '@/static/file-system-seed.manifest.json';

/**
 * Resolves parent ID from a file path
 * e.g., /home/Documents/file.md -> 'documents' (the ID of the Documents folder)
 */
function resolveParentId(filePath: string, existingNodes: Map<string, string>): string | null {
    const pathParts = filePath.split('/').filter(Boolean);
    if (pathParts.length <= 1) return null;

    // Get parent path
    const parentPath = '/' + pathParts.slice(0, -1).join('/');

    // Check if parent exists in our map
    return existingNodes.get(parentPath) || null;
}

/**
 * Generates file system nodes from the seed manifest
 * Files are copied to the public folder and referenced via their public paths
 */
export function generateSeedFiles(existingNodes: FileSystemNode[]): FileSystemNode[] {
    const seedFiles: FileSystemNode[] = [];
    const now = new Date();

    // Create a map of path -> id for quick lookup
    const pathToId = new Map<string, string>();
    existingNodes.forEach(node => {
        pathToId.set(node.path, node.id);
    });

    // Process markdown files
    if (fileSystemSeedManifest.markdowns) {
        fileSystemSeedManifest.markdowns.forEach((md) => {
            // Convert src/static path to public path
            // e.g., ./md/file.md -> /static/md/file.md
            const publicPath = md.path.replace('./', '/static/');
            const fileName = md.name.endsWith('.md') ? md.name : `${md.name}.md`;

            seedFiles.push({
                id: `seed-md-${md.id}`,
                name: fileName,
                type: 'file',
                path: md.location,
                parentId: resolveParentId(md.location, pathToId),
                content: publicPath, // Store the public path to fetch content
                createdAt: now,
                modifiedAt: now,
            });
        });
    }

    // Process image files
    if (fileSystemSeedManifest.images) {
        fileSystemSeedManifest.images.forEach((img) => {
            // Convert src/static path to public path
            const publicPath = img.path.replace('./', '/static/');
            const fileName = img.name.includes('.') ? img.name : `${img.name}.png`;

            seedFiles.push({
                id: `seed-img-${img.id}`,
                name: fileName,
                type: 'file',
                path: img.location,
                parentId: resolveParentId(img.location, pathToId),
                content: publicPath, // Store the public path for the image
                createdAt: now,
                modifiedAt: now,
            });
        });
    }

    // Process song files
    if (fileSystemSeedManifest.songs) {
        fileSystemSeedManifest.songs.forEach((song) => {
            // Convert src/static path to public path
            const publicPath = song.path.replace('./', '/static/');
            const fileName = song.name.endsWith('.mp3') ? song.name : `${song.name}.mp3`;

            seedFiles.push({
                id: `seed-music-${song.id}`,
                name: fileName,
                type: 'file',
                path: song.location,
                parentId: resolveParentId(song.location, pathToId),
                content: publicPath, // Store the public path for the music file
                createdAt: now,
                modifiedAt: now,
            });
        });
    }

    return seedFiles;
}
