import { readTextPreview } from "./desktop";
import { languageFor } from "./language";
import { notifyError } from "../toast";

async function highlight(text: string, language: string, signal: AbortSignal) {
  signal.throwIfAborted();
  const worker = new Worker(new URL("./highlight.worker.ts", import.meta.url), {
    type: "module",
  });
  let abort: (() => void) | undefined;
  try {
    return await new Promise<string | null>((resolve, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
      worker.onmessage = (event: MessageEvent<{ html: string | null }>) =>
        resolve(event.data.html);
      worker.onerror = () =>
        reject(new Error("Could not start syntax highlighting."));
      worker.postMessage({ text, language });
    });
  } finally {
    if (abort) signal.removeEventListener("abort", abort);
    worker.terminate();
  }
}

export async function loadPreview(
  file: { path: string; name: string },
  signal: AbortSignal,
) {
  const { path, name } = file;
  let text: string;
  try {
    text = await readTextPreview(path);
  } catch (error) {
    if (signal.aborted) throw error;
    const message = error instanceof Error ? error.message : String(error);
    notifyError(`Could not preview ${path}: ${message}`);
    return null;
  }
  signal.throwIfAborted();
  const language = languageFor(name);
  if (!language) return { text, html: null };

  try {
    const html = await highlight(text, language, signal);
    if (html === null)
      notifyError(
        `Syntax highlighting unavailable for ${name}; showing plain text.`,
      );
    return { text, html };
  } catch (error) {
    if (signal.aborted) throw error;
    notifyError(
      `Syntax highlighting unavailable for ${name}; showing plain text.`,
    );
    return { text, html: null };
  }
}
