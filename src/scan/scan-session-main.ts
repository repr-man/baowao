import { randomUUID } from "node:crypto";

const sessions = new Set<string>();

export function createScanSession(): string {
  const id = randomUUID();
  sessions.add(id);
  return id;
}

export function assertScanActive(id: string): void {
  if (!sessions.has(id)) throw new Error("Scan cancelled.");
}

export async function stopScanSession(id: string): Promise<void> {
  sessions.delete(id);
}
