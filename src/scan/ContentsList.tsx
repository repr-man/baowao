import { toggleCleanupItem } from "../cleanup/queue";
import { openPath } from "../navigation/store";
import { openPreview } from "../preview/store";
import { createMemo, For, Show } from "solid-js";
import {
  CaretRightRegular,
  FileRegular,
  FilesRegular,
  FolderRegular,
  LinkRegular,
} from "phosphor-solid";
import type { ScanContentProps } from "./ScanWorkspace";
import { colors, size } from "./presentation";

export default function ContentsList(
  props: Pick<ScanContentProps, "entries" | "onActive">,
) {
  const entries = createMemo(() => props.entries);
  return (
    <section class="breakdown" aria-label="Folder contents">
      <div class="list-heading">
        <h2>Contents</h2>
      </div>
      <div class="entry-list">
        <Show
          when={entries().length}
          fallback={<div class="list-empty">This folder is empty.</div>}
        >
          <For each={entries()}>
            {(entry, index) => (
              <div class="entry-row">
                <button
                  class="entry"
                  onMouseDown={(event) => {
                    if (event.button === 1) event.preventDefault();
                  }}
                  onAuxClick={(event) => {
                    if (event.button === 1) {
                      event.preventDefault();
                      toggleCleanupItem(entry);
                    }
                  }}
                  onClick={() => {
                    if (entry.directory) openPath(entry.path);
                    else if (entry.file) openPreview(entry);
                  }}
                  onMouseEnter={() => props.onActive(entry.path)}
                  onMouseLeave={() => props.onActive(null)}
                  onFocus={() => props.onActive(entry.path)}
                  onBlur={() => props.onActive(null)}
                  title={entry.path}
                >
                  <span
                    class="entry-color"
                    style={{
                      "background-color": entry.hardLink
                        ? "transparent"
                        : colors[index() % colors.length],
                    }}
                  />
                  <span
                    class="entry-icon"
                    title={
                      entry.hardLink
                        ? "Hard link"
                        : entry.link
                          ? "Symbolic link"
                          : undefined
                    }
                  >
                    {entry.hardLink ? (
                      <FilesRegular
                        width={20}
                        height={20}
                        aria-label="Hard link"
                      />
                    ) : entry.link ? (
                      <LinkRegular
                        width={20}
                        height={20}
                        aria-label="Symbolic link"
                      />
                    ) : entry.directory ? (
                      <FolderRegular width={20} height={20} />
                    ) : (
                      <FileRegular width={20} height={20} />
                    )}
                  </span>
                  <span class="entry-name">{entry.name}</span>
                  <span class="entry-size">
                    <Show
                      when={!entry.hardLink}
                      fallback={<span class="hard-link-label">Hard link</span>}
                    >
                      <Show
                        when={entry.bytes !== null}
                        fallback={
                          <span>
                            {entry.error ? (
                              "Unavailable"
                            ) : (
                              <span class="skeleton" />
                            )}
                          </span>
                        }
                      >
                        {size(entry.bytes!)}
                      </Show>
                    </Show>
                  </span>
                  <span class="entry-chevron">
                    {entry.directory && (
                      <CaretRightRegular width={16} height={16} />
                    )}
                  </span>
                </button>
              </div>
            )}
          </For>
        </Show>
      </div>
    </section>
  );
}
