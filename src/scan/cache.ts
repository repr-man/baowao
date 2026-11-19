import { createStore } from "solid-js";
import { openPath } from "../navigation/store";
import { notifyError } from "../toast";
import {
  beginScan,
  cancelScan,
  listDirectory,
  measureDirectory,
} from "./desktop";

type Listing = Awaited<ReturnType<typeof listDirectory>>;
export type Scan = Listing & { done: number; total: number; running: boolean };
type ScanState = { scan: Scan | null; loading: boolean };
type ScanRun = { path: string; session: Promise<string>; cancelled: boolean };

const [scanState, setScanState] = createStore<{
  scans: Record<string, ScanState>;
}>({ scans: {} });
let active: ScanRun | undefined;
let request = 0;
let stopped = Promise.resolve();

function update(path: string, change: (state: ScanState) => ScanState) {
  setScanState((draft) => {
    draft.scans[path] = change(
      draft.scans[path] ?? { scan: null, loading: false },
    );
  });
}

function discard(path: string) {
  setScanState((draft) => {
    delete draft.scans[path];
  });
}

function retry(path: string) {
  openPath(path);
  refreshScan(path);
}

function stopActive() {
  const run = active;
  if (!run) return;
  active = undefined;
  run.cancelled = true;
  discard(run.path);
  const cancel = run.session.then(
    (id) => cancelScan(id),
    () => {},
  );
  stopped = Promise.all([stopped, cancel]).then(() => {});
  void stopped.catch(() => {});
}

export function refreshScan(path: string) {
  const ticket = ++request;
  stopActive();
  discard(path);
  void start(path, ticket, true);
}

async function start(path: string, ticket: number, force: boolean) {
  try {
    await stopped;
    if (ticket !== request || (!force && scanState.scans[path])) return;
    const run: ScanRun = { path, session: beginScan(), cancelled: false };
    active = run;
    update(path, () => ({ scan: null, loading: true }));
    try {
      const scanId = await run.session;
      if (run.cancelled) return;
      const listing = await listDirectory(path, scanId);
      if (run.cancelled) return;
      const dirs = listing.entries.filter((entry) => entry.directory);
      update(path, () => ({
        scan: {
          ...listing,
          done: 0,
          total: dirs.length,
          running: dirs.length > 0,
        },
        loading: false,
      }));
      const failures = listing.entries
        .filter((entry) => entry.error)
        .map((entry) => `${entry.path}: ${entry.error}`);
      let next = 0;
      async function worker() {
        while (!run.cancelled && next < dirs.length) {
          const entry = dirs[next++];
          if (!entry) break;
          let result: { bytes: number | null; error: string };
          try {
            result = await measureDirectory(entry.path, scanId);
          } catch (cause) {
            result = {
              bytes: null,
              error: cause instanceof Error ? cause.message : String(cause),
            };
          }
          if (run.cancelled) return;
          if (result.error) failures.push(`${entry.path}: ${result.error}`);
          update(path, (state) =>
            state.scan
              ? {
                  ...state,
                  scan: {
                    ...state.scan,
                    done: state.scan.done + 1,
                    entries: state.scan.entries.map((item) =>
                      item.path === entry.path ? { ...item, ...result } : item,
                    ),
                  },
                }
              : state,
          );
        }
      }
      await Promise.all(
        Array.from({ length: Math.min(4, dirs.length) }, () => worker()),
      );
      if (!run.cancelled && failures.length)
        notifyError(
          `Some entries could not be measured:\n${failures.join("\n")}`,
          {
            action: { label: "Retry", run: () => retry(path) },
          },
        );
      if (!run.cancelled)
        update(path, (state) =>
          state.scan
            ? { ...state, scan: { ...state.scan, running: false } }
            : state,
        );
    } catch (cause) {
      if (!run.cancelled)
        update(path, () => ({
          scan: null,
          loading: false,
        }));
      if (!run.cancelled) {
        const message = cause instanceof Error ? cause.message : String(cause);
        notifyError(`Could not scan ${path}: ${message}`, {
          action: { label: "Retry", run: () => retry(path) },
        });
      }
    } finally {
      if (active === run) active = undefined;
      if (!run.cancelled)
        void run.session
          .then(
            (id) => cancelScan(id),
            () => {},
          )
          .catch(() => {});
    }
  } catch (cause) {
    if (ticket === request)
      update(path, () => ({
        scan: null,
        loading: false,
      }));
    if (ticket === request) {
      const message = cause instanceof Error ? cause.message : String(cause);
      notifyError(`Could not scan ${path}: ${message}`, {
        action: { label: "Retry", run: () => retry(path) },
      });
    }
  }
}

export function selectScan(path: string | null) {
  const ticket = ++request;
  if (active?.path !== path) stopActive();
  if (path && active?.path !== path) void start(path, ticket, false);
}

export function invalidateScans() {
  request++;
  stopActive();
  setScanState((draft) => {
    draft.scans = {};
  });
}

export function disposeScans() {
  request++;
  stopActive();
}

export { scanState };
