import { deleteItems } from "./desktop";
import { notifyError } from "../toast";
import { navigation, openPath } from "../navigation/store";
import { invalidateScans, refreshScan } from "../scan/cache";
import { createStore } from "solid-js";
import type { Scan } from "../scan/cache";

export type QueueItem = {
  path: string;
  name: string;
  directory: boolean;
  link: boolean;
  device: number;
  inode: number;
};

export type CleanupState = {
  items: QueueItem[];
  deleting: boolean;
};

const [cleanup, setCleanup] = createStore<CleanupState>({
  items: [],
  deleting: false,
});

export function toggleCleanupItem(entry: Scan["entries"][number]) {
  if (
    cleanup.deleting ||
    entry.hardLink ||
    entry.device === null ||
    entry.inode === null
  )
    return;
  const item: QueueItem = {
    path: entry.path,
    name: entry.name,
    directory: entry.directory,
    link: entry.link,
    device: entry.device,
    inode: entry.inode,
  };
  setCleanup((draft) => {
    const index = draft.items.findIndex((queued) => queued.path === item.path);
    if (index >= 0) draft.items.splice(index, 1);
    else draft.items.push(item);
  });
}

export function removeCleanupItem(path: string) {
  if (cleanup.deleting) return;
  setCleanup((draft) => {
    draft.items = draft.items.filter((item) => item.path !== path);
  });
}

export async function deleteQueued(queued: QueueItem[]) {
  if (cleanup.deleting || !queued.length) return;

  setCleanup((draft) => {
    draft.deleting = true;
  });
  try {
    const results = await deleteItems(queued);
    const errors = new Map(
      results.map((result) => [result.path, result.error]),
    );
    const failures = queued.flatMap((item) => {
      const failure = errors.get(item.path);
      return failure === ""
        ? []
        : [`${item.path}: ${failure ?? "No deletion result returned."}`];
    });
    if (failures.length) notifyError(failures.join("\n"));
    setCleanup((draft) => {
      draft.items = queued.filter((item) => errors.get(item.path) !== "");
    });

    invalidateScans();
    const selected = navigation.path;
    if (selected) {
      const removed = queued
        .filter(
          (item) =>
            item.directory &&
            errors.get(item.path) === "" &&
            (selected === item.path || selected.startsWith(`${item.path}/`)),
        )
        .sort((a, b) => a.path.length - b.path.length)[0];
      if (removed)
        openPath(removed.path.slice(0, removed.path.lastIndexOf("/")) || "/");
      else refreshScan(selected);
    }
  } catch (cause) {
    invalidateScans();
    const selected = navigation.path;
    if (selected) refreshScan(selected);
    notifyError(cause);
  } finally {
    setCleanup((draft) => {
      draft.deleting = false;
    });
  }
}

export { cleanup };
