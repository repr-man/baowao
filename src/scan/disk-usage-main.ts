import { lstat, opendir } from "node:fs/promises";
import { join } from "node:path";
import { assertScanActive } from "./scan-session-main";

export async function measureWithoutHardLinks(
  path: string,
  scanId: string,
): Promise<{ bytes: number | null; error: string }> {
  try {
    let bytes = 0;
    const pending = [path];
    while (pending.length) {
      assertScanActive(scanId);
      const current = pending.pop()!;
      const stat = await lstat(current);
      assertScanActive(scanId);
      if (stat.isDirectory() || stat.nlink <= 1) {
        bytes += stat.blocks * 512;
        if (!Number.isSafeInteger(bytes))
          throw new Error("Disk usage exceeds the supported size.");
      }
      if (!stat.isDirectory()) continue;
      const directory = await opendir(current);
      for await (const entry of directory) {
        assertScanActive(scanId);
        pending.push(join(current, entry.name));
      }
    }
    return { bytes, error: "" };
  } catch (error) {
    return {
      bytes: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
