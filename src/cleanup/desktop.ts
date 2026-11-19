"use main";

import { lstat, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { deleteDirectoryWithoutHardLinks } from "./delete-main";

export async function deleteItems(
  items: { path: string; device: number; inode: number; directory: boolean }[],
) {
  const results: { path: string; error: string }[] = [];
  const deletedDirectories: string[] = [];
  for (const item of [...items].sort((a, b) => a.path.length - b.path.length)) {
    try {
      if (
        !item.path.startsWith("/") ||
        resolve(item.path) !== item.path ||
        item.path === "/"
      )
        throw new Error("Invalid path.");
      if (
        deletedDirectories.some((parent) => item.path.startsWith(`${parent}/`))
      ) {
        results.push({ path: item.path, error: "" });
        continue;
      }
      const stat = await lstat(item.path);
      if (
        stat.dev !== item.device ||
        stat.ino !== item.inode ||
        stat.isDirectory() !== item.directory
      ) {
        throw new Error("Item changed since it was added to the queue.");
      }
      if (!stat.isDirectory() && stat.nlink > 1)
        throw new Error("Hard links cannot be deleted.");
      if (stat.isDirectory()) await deleteDirectoryWithoutHardLinks(item.path);
      else await rm(item.path);
      if (item.directory) deletedDirectories.push(item.path);
      results.push({ path: item.path, error: "" });
    } catch (error) {
      results.push({
        path: item.path,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}
