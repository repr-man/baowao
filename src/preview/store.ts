import { createStore } from "solid-js";
import type { Scan } from "../scan/cache";

const [preview, setPreview] = createStore<{
  file: Scan["entries"][number] | null;
}>({ file: null });

export function openPreview(file: Scan["entries"][number]) {
  setPreview((draft) => {
    draft.file = file;
  });
}

export function closePreview() {
  setPreview((draft) => {
    draft.file = null;
  });
}

export { preview };
