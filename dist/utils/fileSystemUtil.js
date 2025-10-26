import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
export const BASE_DIR = path.resolve(process.env.FOLDER_BROWSER_PATH || path.join(process.cwd(), 'data'));
async function ensureBaseDir() {
    await fs.mkdir(BASE_DIR, { recursive: true });
}
export function safePath(relPath) {
    if (!relPath)
        throw new Error('Path is required');
    if (path.isAbsolute(relPath) || relPath.includes('..') || relPath.includes('\0')) {
        throw new Error('Invalid path');
    }
    const resolved = path.resolve(BASE_DIR, relPath);
    if (!resolved.startsWith(BASE_DIR + path.sep) && resolved !== BASE_DIR) {
        throw new Error('Invalid path');
    }
    console.log('Resolved path:', resolved);
    return resolved;
}
export async function list(relPath = '.') {
    await ensureBaseDir();
    const dirPath = safePath(relPath);
    const itemNames = await fs.readdir(dirPath);
    const items = await Promise.all(itemNames.map(async (name) => {
        const itemPath = path.join(dirPath, name);
        const stat = await fs.stat(itemPath);
        return {
            name,
            isDirectory: stat.isDirectory(),
            size: stat.size,
            modifiedTime: stat.mtime,
            birthTime: stat.birthtime
        };
    }));
    return items;
}
export async function create(relPath, content = '') {
    const filePath = safePath(relPath);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    return { created: relPath };
}
export async function remove(relPath) {
    const filePath = safePath(relPath);
    await fs.rm(filePath, { recursive: true, force: true });
    return { removed: relPath };
}
export async function copy(srcRelPath, destRelPath) {
    const srcPath = safePath(srcRelPath);
    const destPath = safePath(destRelPath);
    const stat = await fs.stat(srcPath).catch(() => null);
    if (!stat)
        throw new Error('Source not found');
    if (stat.isDirectory()) {
        await copyDirectory(srcPath, destPath);
    }
    else {
        const destDir = path.dirname(destPath);
        await fs.mkdir(destDir, { recursive: true });
        await fs.copyFile(srcPath, destPath);
    }
    return { copied: srcRelPath };
}
async function copyDirectory(srcDir, destDir) {
    await fs.mkdir(destDir, { recursive: true });
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        }
        else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
export async function move(srcRelPath, destRelPath) {
    const srcPath = safePath(srcRelPath);
    const destPath = safePath(destRelPath);
    const stat = await fs.stat(srcPath).catch(() => null);
    if (!stat)
        throw new Error('Source not found');
    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });
    await fs.rename(srcPath, destPath);
    return { moved: srcRelPath };
}
