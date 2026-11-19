import { lstat, readdir, rmdir, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";

async function inspectTree(path: string, device: number): Promise<void> {
  const stat = await lstat(path);
  if (stat.dev !== device)
    throw new Error("A mounted filesystem was found; deletion was stopped.");
  if (!stat.isDirectory()) {
    if (stat.nlink > 1)
      throw new Error("This folder contains hard links and cannot be deleted.");
    return;
  }
  for (const name of await readdir(path))
    await inspectTree(join(path, name), device);
}

async function removeTree(path: string, device: number): Promise<void> {
  const stat = await lstat(path);
  if (stat.dev !== device)
    throw new Error("A mounted filesystem was found; deletion was stopped.");
  if (!stat.isDirectory()) {
    if (stat.nlink > 1)
      throw new Error(
        "The folder changed during deletion; hard links were kept and deletion may be incomplete.",
      );
    await unlink(path);
    return;
  }
  for (const name of await readdir(path))
    await removeTree(join(path, name), device);
  await rmdir(path);
}

export async function deleteDirectoryWithoutHardLinks(
  path: string,
): Promise<void> {
  const root = await lstat(path);
  if (!root.isDirectory()) throw new Error("The path is not a directory.");
  const parent = await lstat(dirname(path));
  if (root.dev !== parent.dev)
    throw new Error("A mounted filesystem was found; deletion was stopped.");
  // Check the complete tree before changing it, then recheck links while removing
  // entries so hard links introduced after inspection are left in place.
  await inspectTree(path, root.dev);
  await removeTree(path, root.dev);
}
