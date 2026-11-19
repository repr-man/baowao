"use main";

import { clipboard, dialog } from "electron";
import { homedir } from "node:os";

export async function chooseDirectory(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "showHiddenFiles"],
    defaultPath: homedir(),
  });
  return result.canceled ? null : (result.filePaths[0] ?? null);
}

export async function homeDirectory(): Promise<string> {
  return homedir();
}

export async function copyPath(path: string): Promise<void> {
  clipboard.writeText(path);
}
