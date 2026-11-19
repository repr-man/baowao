import { createStore } from "solid-js";
import { selectScan } from "../scan/cache";

const [navigation, setNavigation] = createStore<{ path: string | null }>({
  path: null,
});
let selectedPath: string | null | undefined;

export function selectPath(path: string | null) {
  if (path === selectedPath) return;
  selectedPath = path;
  setNavigation((draft) => {
    draft.path = path;
  });
  selectScan(path);
}

export function openPath(path: string) {
  if (path === selectedPath) return;
  window.location.hash = `/?path=${encodeURIComponent(path)}`;
  selectPath(path);
}

export function resetNavigation() {
  selectedPath = undefined;
}

export { navigation };
