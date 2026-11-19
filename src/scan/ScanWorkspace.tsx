import { createMemo, createSignal, Show } from "solid-js";
import { HardDrivesRegular } from "phosphor-solid";
import { navigation, openPath } from "../navigation/store";
import { scanState, refreshScan } from "./cache";
import type { Scan } from "./cache";
import PathBar from "../navigation/PathBar";
import ContentsList from "./ContentsList";
import DiskChart from "./DiskChart";
import { sortedEntries } from "./presentation";

type Entry = Scan["entries"][number];

export type ScanContentProps = {
  scan: Scan;
  entries: Entry[];
  active: string | null;
  onActive: (path: string | null) => void;
};

export default function ScanWorkspace() {
  const selected = createMemo(() =>
    navigation.path ? scanState.scans[navigation.path] : undefined,
  );
  const scan = createMemo(() => selected()?.scan ?? null);
  function refresh() {
    if (navigation.path) refreshScan(navigation.path);
  }
  const entries = createMemo(() => {
    const current = scan();
    return current ? sortedEntries(current) : [];
  });
  const [active, setActive] = createSignal<string | null>(() => {
    navigation.path;
    return null;
  });

  return (
    <main class="workspace">
      <Show
        when={scan()}
        fallback={
          <section class="empty-state">
            <Show
              when={
                !!navigation.path &&
                (!selected() || selected()?.loading === true)
              }
              fallback={
                <Show
                  when={navigation.path}
                  fallback={
                    <>
                      <div class="empty-art">
                        <div class="empty-ring">
                          <div class="empty-core">
                            <HardDrivesRegular width={35} height={35} />
                          </div>
                        </div>
                      </div>
                      <h1>See where your space goes.</h1>
                      <p>
                        Choose a folder from the sidebar to explore its disk
                        usage.
                      </p>
                    </>
                  }
                >
                  <h1>Folder unavailable</h1>
                  <p>This folder couldn’t be scanned. Try again.</p>
                  <button
                    class="unavailable-retry"
                    type="button"
                    onClick={refresh}
                  >
                    Retry scan
                  </button>
                </Show>
              }
            >
              <div
                class="loading-ring"
                aria-label="Reading folder"
                role="status"
              />
              <span class="loading-line skeleton" />
            </Show>
          </section>
        }
      >
        {(current) => (
          <>
            <PathBar
              path={current().path}
              onRefresh={refresh}
              onNavigate={openPath}
            />
            <div class="content">
              <DiskChart
                scan={current()}
                entries={entries()}
                active={active()}
                onActive={setActive}
              />
              <ContentsList entries={entries()} onActive={setActive} />
            </div>
          </>
        )}
      </Show>
    </main>
  );
}
