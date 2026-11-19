import { cleanup, toggleCleanupItem } from "../cleanup/queue";
import { openPath } from "../navigation/store";
import { openPreview } from "../preview/store";
import { createMemo, For, Show } from "solid-js";
import type { ScanContentProps } from "./ScanWorkspace";
import { colors, size } from "./presentation";

export default function DiskChart(props: ScanContentProps) {
  const current = () => props.scan;
  const entries = createMemo(() => props.entries);
  const totalBytes = createMemo(
    () =>
      current().ownBytes +
      current().entries.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0),
  );
  const segments = createMemo(() => {
    let offset = 0;
    const total = totalBytes();
    return entries().map((entry) => {
      const start = offset;
      const fraction = total ? (entry.bytes ?? 0) / total : 0;
      offset += fraction;
      return { start, fraction };
    });
  });
  const highlighted = createMemo(() =>
    entries().find((entry) => entry.path === props.active),
  );

  return (
    <section class="overview" aria-label="Disk usage chart">
      <div class="section-heading">
        <div>
          <h1>{current().name}</h1>
          <p>
            {current().running
              ? "Scanning folders…"
              : `${current().entries.length} items`}
          </p>
        </div>
      </div>
      <div class="chart-wrap">
        <svg
          class="chart"
          viewBox="0 0 320 320"
          role="img"
          aria-label={`Disk usage in ${current().name}. Select a directory from the list to explore it.`}
        >
          <circle
            cx="160"
            cy="160"
            r="112"
            fill="none"
            stroke="#ede9e0"
            stroke-width="43"
          />
          <For each={entries()}>
            {(entry, index) => (
              <Show when={segments()[index()]!.fraction > 0}>
                <circle
                  cx="160"
                  cy="160"
                  r="112"
                  fill="none"
                  stroke={colors[index() % colors.length]}
                  stroke-width={props.active === entry.path ? 49 : 43}
                  pathLength="1"
                  stroke-dasharray={`${segments()[index()]!.fraction} ${1 - segments()[index()]!.fraction}`}
                  stroke-dashoffset={-segments()[index()]!.start}
                  transform="rotate(-90 160 160)"
                  class="chart-segment"
                  onMouseDown={(event) => {
                    if (event.button === 1) event.preventDefault();
                  }}
                  onAuxClick={(event) => {
                    if (event.button === 1) {
                      event.preventDefault();
                      toggleCleanupItem(entry);
                    }
                  }}
                  onMouseEnter={() => props.onActive(entry.path)}
                  onMouseLeave={() => props.onActive(null)}
                  onClick={() => {
                    if (entry.directory) openPath(entry.path);
                    else if (entry.file) openPreview(entry);
                  }}
                />
              </Show>
            )}
          </For>
          <For each={entries()}>
            {(entry, index) => (
              <Show
                when={
                  segments()[index()]!.fraction > 0 &&
                  cleanup.items.some((item) => item.path === entry.path)
                }
              >
                <circle
                  cx="160"
                  cy="160"
                  r="112"
                  fill="none"
                  stroke="black"
                  stroke-opacity="0.45"
                  stroke-width={props.active === entry.path ? 49 : 43}
                  pathLength="1"
                  stroke-dasharray={`${segments()[index()]!.fraction} ${1 - segments()[index()]!.fraction}`}
                  stroke-dashoffset={-segments()[index()]!.start}
                  transform="rotate(-90 160 160)"
                  class="chart-overlay"
                  aria-hidden="true"
                />
              </Show>
            )}
          </For>
        </svg>
        <div class="chart-center">
          <span>{highlighted()?.name ?? current().name}</span>
          <strong>
            {highlighted()?.hardLink
              ? "Excluded"
              : highlighted()
                ? highlighted()!.bytes === null
                  ? "Unavailable"
                  : size(highlighted()!.bytes!)
                : size(totalBytes())}
          </strong>
          <small>
            {highlighted()?.hardLink
              ? "Hard link"
              : highlighted()
                ? highlighted()!.bytes === null
                  ? highlighted()!.error
                    ? "Unavailable"
                    : "Measuring…"
                  : `${((highlighted()!.bytes! / (totalBytes() || 1)) * 100).toFixed(1)}% of folder`
                : current().running ||
                    current().entries.some((entry) => entry.error)
                  ? "measured so far"
                  : "total used"}
          </small>
        </div>
      </div>
      <Show when={current().running}>
        <div class="progress" role="status">
          <div class="progress-track">
            <div
              style={{
                width: `${current().total ? (current().done / current().total) * 100 : 0}%`,
              }}
            />
          </div>
          <span>
            Scanning {current().done} of {current().total} folders
          </span>
        </div>
      </Show>
    </section>
  );
}
