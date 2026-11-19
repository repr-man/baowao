"use main";

import { open } from "node:fs/promises";
import { constants } from "node:fs";

export async function readTextPreview(path: string): Promise<string> {
  const limit = 1024 * 1024;
  const file = await open(
    path,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new Error("Only regular files can be previewed.");
    if (stat.size > limit)
      throw new Error("This file is too large to preview (maximum 1 MiB).");
    const buffer = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(
        buffer,
        length,
        buffer.length - length,
        null,
      );
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > limit)
      throw new Error("This file is too large to preview (maximum 1 MiB).");
    const bytes = buffer.subarray(0, length);
    if (bytes.includes(0))
      throw new Error("This file does not appear to be text.");
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("This file is not valid UTF-8 text.");
    }
  } finally {
    await file.close();
  }
}
