"use main";

import { readdir, lstat, realpath } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { measureWithoutHardLinks } from "./disk-usage-main";
import {
  assertScanActive,
  createScanSession,
  stopScanSession,
} from "./scan-session-main";

export async function beginScan(): Promise<string> {
  return createScanSession();
}

export async function cancelScan(id: string): Promise<void> {
  await stopScanSession(id);
}

export async function listDirectory(input: string, scanId: string) {
  assertScanActive(scanId);
  const path = await realpath(resolve(input));
  assertScanActive(scanId);
  const root = await lstat(path);
  if (!root.isDirectory()) throw new Error("Choose a directory to scan.");
  assertScanActive(scanId);
  const names = await readdir(path);
  assertScanActive(scanId);
  type Entry = {
    path: string;
    name: string;
    directory: boolean;
    file: boolean;
    link: boolean;
    hardLink: boolean;
    bytes: number | null;
    device: number | null;
    inode: number | null;
    error: string;
  };
  const entries: Entry[] = new Array(names.length);
  let next = 0;
  async function readEntries() {
    while (next < names.length) {
      assertScanActive(scanId);
      const index = next++;
      const name = names[index]!;
      const child = join(path, name);
      try {
        const stat = await lstat(child);
        entries[index] = {
          path: child,
          name,
          directory: stat.isDirectory(),
          file: stat.isFile(),
          link: stat.isSymbolicLink(),
          hardLink: !stat.isDirectory() && stat.nlink > 1,
          bytes: stat.isDirectory()
            ? null
            : stat.nlink > 1
              ? 0
              : stat.blocks * 512,
          device: stat.dev,
          inode: stat.ino,
          error: "",
        };
      } catch (error) {
        entries[index] = {
          path: child,
          name,
          directory: false,
          file: false,
          link: false,
          hardLink: false,
          bytes: null,
          device: null,
          inode: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(32, names.length) }, () => readEntries()),
  );
  assertScanActive(scanId);
  return {
    path,
    name: basename(path) || path,
    ownBytes: root.blocks * 512,
    entries,
  };
}

export async function measureDirectory(
  path: string,
  scanId: string,
): Promise<{ bytes: number | null; error: string }> {
  return measureWithoutHardLinks(path, scanId);
}
